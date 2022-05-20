/**
 * @author Benjamin Guirlet
 * @file
 *      Cet event permet de gérer les likes et reposts.
 *      Il permet aussi d'ajouter des memes qui ne sont pas dans la base de données grâce aux réactions.
 */


const msgUtils = require( `${process.cwd()}/utils/messageUtils` );
const { MessageReaction, Client, User } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'event 'messageReactionAdd'.
 * @param {MessageReaction} reaction L'objet de la réaction.
 * @param {User} user L'utilisateur qui a ajouté la réaction.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( reaction, user, client ) {
	// await msgUtils.updateMessageReactions( reaction, user, client );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageReactionAdd",
	execute
}
