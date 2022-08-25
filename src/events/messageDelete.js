/**
 * @author Benjamin Guirlet
 * @file
 *		Handler pour l'évènement messageDelete.
 */

const { Client, Message } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {Message} message Le message qui vient d'être supprimé.
 * @param {Client} client Le client du bot.
 */
async function execute( message, client ) {
	if ( !message ) return;

	const msgManager = client.db.messagesManager;
	const msg = await msgManager.updateMessage( message.id, "b_removed", true );
	if ( msg ) await client.modules.get( "logs" ).memeSupprime( message, msg );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageDelete",
	execute
}
