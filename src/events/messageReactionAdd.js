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
	const channel = await sqlUtils.getChannel( messageReaction.message.channelId );

	if ( channel["memes"] ) {

	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionAdd",
	execute
}
