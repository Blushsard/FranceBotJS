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

function sleep( ms ) {
	return new Promise(resolve => setTimeout( resolve, ms ) );
}


// A décommenter une fois que le code sera sur le vps pour charger les utilisateurs dans la base de données.
const data = require( "./python_scripts/data.json" );
console.log( "Nombre d'utilisateurs: " + data.length );
let cpt = 1;
for ( let user of data ) {
	(async ( cpt ) => {
		try {
			let level = 0;
			while ( ((5 * level**2 + 50) * level) < user['xp'] )
				level++;

			await client.db.usersManager.addUser(
				user['id'],
				level - 1,
				user['xp'],
				user['messages'],
				user['progress']
			);
		}
		catch ( err ) { console.log( err ); }
		console.log( "Nombre d'utilisateurs ajoutés: " + cpt );
	})( cpt++ );
}

// Démarrage du client.
(async () => {
	await loadCommands( client );
	await loadEvents( client );
	await client.login( process.env.TOKEN );

	await loadModules( client );

	// Dé-commenter les lignes suivantes pour charger dans le serveur de dev de nouvelles commands ou les mise à jour
	// sur les commands.
	const { loadCommandsToGuild } = require( "./utils/loadAssets" );
	await loadCommandsToGuild( client, process.env.GUILD_ID );
})();