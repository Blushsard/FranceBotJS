/**
 * @author Benjamin Guirlet
 * @file
 *      This event is used to track the likes and repost of the messages.
 *      If a message with a meme is not in the database, then it will be added.
 */


const msgUtils = require( `${process.cwd()}/utils/messageUtils` );
const { MessageReaction, Client, User } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement 'messageReactionRemove'.
 * @param {MessageReaction} reaction L'objet de la réaction.
 * @param {User} user L'utilisateur qui a retiré la réaction.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( reaction, user, client ) {
	// await msgUtils.updateMessageReactions( reaction, user, client );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionRemove",
	execute
}
