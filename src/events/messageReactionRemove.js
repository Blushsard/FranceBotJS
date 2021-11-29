/**
 * @author Benjamin Guirlet
 * @description
 *      This event is used to track the likes and repost of the messages.
 *      If a message with a meme is not in the database, then it will be added.
 */


const msgUtils = require( "../utils/messageUtils" );
const { MessageReaction, Client, User } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Function called when the event 'messageReactionRemove' is emitted.
 * @param {MessageReaction} reaction The reaction object.
 * @param {User} user The user that applied the guild or reaction emoji.
 * @param {Client} client The client that emitted the event.
 */
async function execute( reaction, user, client ) {
	// the addToDatabase attribute is a manually added attribute in case the message is not in the database.
	// Refers to messageUtils.js -> beginning of updateMessageReactions().
	if ( reaction.message.addToDatabase ) {
		msgUtils.addMemeToDatabase( reaction.message, 0, 0 )
			.then( async () => await msgUtils.updateMessageReactions( reaction, user, client ) );
		return;
	}
	await msgUtils.updateMessageReactions( reaction, user, client );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionRemove",
	execute
}
