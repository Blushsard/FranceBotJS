/**
 * @author Benjamin Guirlet
 * @description
 *      Le point de base du bot.
 */
const { Client, Intents, Collection } = require( "discord.js" );
const { loadCommands, loadEvents } = require( `${process.cwd()}/utils/loadAssets` );
const {loadModules} = require("./utils/loadAssets");
require( "dotenv" ).config( { path: '.env.local' } );


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
client.modules = new Collection();
(async () => {
	await loadCommands( client );
	await loadEvents( client );
	await client.login( process.env.TOKEN );

	await loadModules( client );

	// Dé-commenter les lignes suivantes pour charger dans le serveur de dev de nouvelles commands ou les mise à jour
	// sur les commands.
	const { loadCommandsToGuild } = require( "./utils/loadAssets" );
	await loadCommandsToGuild( client, "908744886474407988" );
})();