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
	await client.modules.get( "moyenne" ).calcMoyenne( 10_000 );
	await client.modules.get( "feed" ).feed( 1000 );
	await client.modules.get( "reddit" ).reddit( 1000 );
	await client.modules.get( "twitter" ).twitter( 60_000 * 30 );

	// Envoi du message de connexion en pm.
	const recipient = await client.users.fetch( process.env.RECIPIENT_CONN_MSG );
	const connEmbed = new MessageEmbed()
		.setTitle( "Bot connecté!" )
		.setDescription( date.toString() );
	await recipient.send( { embeds: [ connEmbed ] } );

	// Exécuter une seule fois la fonction ci-dessous.
	// await applyRateLimitPerUserOnThread( client );
}


async function applyRateLimitPerUserOnThread( client ) {
	const channelsToRateLimit = [
		"756161146620215337",
		"798706955912871986",
		"963121335893110794",
		"833413936090054666",
		"973318926064832622",
		"975408485711884328",
		"985921255205126245",
		"989868253822193665",
		"942853519445221446",
		"944667264223961108",
		"724408590462484500",
		"724408703687721025",
		"808766884433625148",
		"805106411884249118",
		"794247149138214943",
		"866715416714018836",
		"758064762272743506",
		"873519474375032892",
		"880424147459665960",
		"772140977921982474",
		"772926806725623810",
		"843535655724515388",
		"736668886887432285",
		"736668915010109552",
		"743236325066670170",
		"778672634387890196",
		"776582667122638878",
		"781958864664395836",
		"988437862003392583",
		"787800274453921802",
		"937789998361628712",
		"747076737862467614",
		"749773044410744842",
		"772127396350263336",
		"769489233990909982",
		"777638187958927381",
		"781928226180038766",
		"779455640664801280",
		"806319231310102528",
		"777890981877645362",
		"745017884757196821",
		"780196109465026661",
		"834224018781503518",
		"792588957413015602",
		"793875021918765086",
		"806320178215518208",
		"780131233526054942",
	];
	const guild = await client.guilds.fetch( "724408079550251080" );
	const channels = await guild.channels.fetch();
	for ( let channel of channels ) {
		if ( channel.isThread() && channelsToRateLimit.includes( channel.id ) ) {
			await channel.setRateLimitPerUser( 60 );
			console.log( "DONE: " + channel.name );
		}
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "ready",
	execute
}