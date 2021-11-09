/**
 * @author Benjamin Guirlet
 * @description
 *      This event is used to track the likes and repost of the messages.
 *      If a message with a meme is not in the database, then it will be added.
 */


const sqlUtils = require( "../utils/sqlUtils" );
const { LIKE_EMOJI, REPOST_EMOJI } = require("../files/config.json");
const { MessageReaction, Client, User } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Function called when the event 'messageCreate' is emitted.
 * @param {MessageReaction} messageReaction The reaction object.
 * @param {User} user The user that applied the guild or reaction emoji.
 * @param {Client} client The client that emitted the event.
 */
async function execute( messageReaction, user, client ) {
	// Checking if the bot is at the origin of the event.
	if ( user.id === client.id ) return;


	const channel = await sqlUtils.fetchChannel( messageReaction.message.channelId );

	if ( channel["memes"] ) {
		if ( messageReaction.emoji.name === LIKE_EMOJI ) {
			const messageDb = await sqlUtils.fetchMessage( messageReaction.message.id );
			// If the message is in the database.
			if ( messageDb ) {
				await sqlUtils.updateMessage(
					messageDb[0]["msg_id"],
					"likes",
					messageReaction.count - 1
				)
			}
			// We add the message in the database if it is not in.
			else {

			}
		}
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionAdd",
	execute
}
