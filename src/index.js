/**
 * @author Benjamin Guirlet
 * @description
 *      Le point de base du bot.
 */
const { Client, Intents, Collection } = require( "discord.js" );
const { loadCommands, loadEvents, loadModules } = require( `${process.cwd()}/utils/loadAssets` );
const { Database } = require( `${process.cwd()}/database/Database.js` );

require( "dotenv" ).config( { path: '.env.local' } );


const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	],
	partials: [
		"MESSAGE",
		"REACTION"
	]
});


// Chargement des attributs du client.
client.commands = new Collection();
client.modules = new Collection();
client.db = new Database();


// Démarrage du client.
(async () => {
	await loadCommands( client );
	await loadEvents( client );
	await loadModules( client );

	await client.login( process.env.TOKEN );

	// Dé-commenter les lignes suivantes pour charger dans le serveur de dev de nouvelles commands ou les mise à jour
	// sur les commands.
	const { loadCommandsToGuild } = require( "./utils/loadAssets" );
	await loadCommandsToGuild( client, process.env.GUILD_ID );
})();