/**
 * @author Benjamin Guirlet
 * @file
 *		L'évènement 'ready' permet de lancer des fonctionnalités tournant h24 en background ainsi que de charger des
 *		permisssions, etc.
 */

const { Client, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Event appelé lorsque le bot est connecté.
 * @param {Client} client Le client du bot.
 */
async function execute( client ) {
	const date = new Date();
	console.log( `${client.user.username} is connected at ${date}!` );
	await client.modules.get( "moyenne" ).calcMoyenne( 60_000 );
	await client.modules.get( "feed" ).feed( 60_000 );
	await client.modules.get( "reddit" ).reddit( 60_000 * 30 );
	await client.modules.get( "twitter" ).twitter( 60_000 * 30 );

	// Envoi du message de connexion en pm.
	const recipient = await client.users.fetch( process.env.RECIPIENT_CONN_MSG );
	const connEmbed = new MessageEmbed()
		.setTitle( "Bot connecté!" )
		.setDescription( date.toString() );
	// await recipient.send( { embeds: [ connEmbed ] } );
	// TODO décommenter la ligne précédente.
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "ready",
	execute
}