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
 * Handler pour l'évènement 'messageCreate'.
 * @param {Message} message Le message qui vient d'être créé.
 * @param {Client} client Le client qui a émit l'évènement.
 */
async function execute( message, client ) {
	// Il faut récupérer le salon dans la base de données.
	const salon = await client.db.channelsManager.fetchChannel( message.channelId );
	if ( !salon ) return;

	await client.modules.get( 'levels' ).ajouterExperienceMessage( message, salon );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
