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
	// Il faut récupérer le salon dans la base de données.
	const salon = await client.db.channelsManager.fetchChannel( message.channelId );

	await client.modules.get( 'memes' ).supprimerMessageMeme( message.id, salon );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageDelete",
	execute
}
