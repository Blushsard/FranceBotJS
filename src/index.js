/**
 * @author Benjamin Guirlet
 * @file
 * 		Le fichier de base du bot.
 */


const { TOKEN } = require( `${process.cwd()}/files/authKey.json` );
const { Client, Collection, Intents } = require( "discord.js" );
const { loadCommands, loadEvents } = require( `${process.cwd()}/utils/loadAssets` );


const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	],
	partials: [
		"MESSAGE",
		"REACTION"
	]
});


client.commands = new Collection();
(async () => {
	await loadCommands( client );
	await loadEvents( client );
	await client.login( TOKEN );

	// Dé-commenter les lignes suivantes pour charger dans le serveur de dev de nouvelles commandes ou les mise à jour
	// sur les commandes.
	/* const { DEV_GUILD_ID } = require( "./files/config.json" );
	const { loadCommandsToGuild } = require( "./utils/loadAssets" );
	await loadCommandsToGuild( client, DEV_GUILD_ID ); */
})();


module.exports = {
	client: client
}

/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
