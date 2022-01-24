/**
 * @author Benjamin Guirlet
 * @file
 * 		Le fichier de base du bot.
 */


const { TOKEN } = require( "./files/authKey.json" );
const { Client, Collection, Intents } = require( "discord.js" );
const { loadCommands, loadEvents } = require( "./utils/loadAssets" );


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

	// Dé-commenté les lignes suivantes pour charger dans le serveur de dev de nouvelles commandes ou les mise à jour
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
