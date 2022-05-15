/**
 * @author Benjamin Guirlet
 * @file
 * 		Permet de supprimer les messages de la base de données lorsqu'ils sont supprimés du serveur.
 */


const { Message, Client } = require( "discord.js" );
const sqlUtils = require( `${process.cwd()}/utils/sqlUtils` );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement 'messageDelete'.
 * @param {Message} message Le message qui a déclenché l'évènement.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( message, client ) {
	const msg = await sqlUtils.fetchMessage( message.id );
	if ( msg ) {
		await sqlUtils.removeMessage(message.id);
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageDelete",
	execute
}