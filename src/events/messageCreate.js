/**
 * @author Benjamin Guirlet
 * @file
 *		Handler pour l'évènement messageCreate.
 *		Cet évènement est utilisé dans de multiples modules.
 */

const { Client, Message } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {Message} message Le message qui vient d'être créé.
 * @param {Client} client Le client du bot.
 */
async function execute( message, client ) {
	if ( !message ) return;

	// Il faut récupérer le salon dans la base de données.
	const salon = await client.db.channelsManager.fetchChannel( message.channelId );

	await client.modules.get( "vote" ).ajouterEmojiVote( message, salon );
	await client.modules.get( 'levels' ).ajouterExperienceMessage( message, salon );

	const messageDeleted = await client.modules.get( 'threads' ).ajouterThread( message, salon );
	if ( messageDeleted ) return;
	await client.modules.get( 'likes' ).ajouterMessageMeme( message, salon, 0 );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
