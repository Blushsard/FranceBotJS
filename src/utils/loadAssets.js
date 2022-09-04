/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient les fonctions permettant de charger les commands dans le client et dans les guilds sur
 * 		lesquelles le client se trouve.
 */

const baseModDir = `${process.cwd()}/modules`;
const { Client } = require( "discord.js" );
const { Levels } = require( `${baseModDir}/Levels` );
const { Likes } = require( `${baseModDir}/Likes` );
const { Logs } = require( `${baseModDir}/Logs` );
const { Moyenne } = require( `${baseModDir}/Moyenne` );
const { Reposts } = require( `${baseModDir}/Reposts` );
const { Threads } = require( `${baseModDir}/Threads` );
const { Feed } = require( `${baseModDir}/Feed` );
const { Reddit } = require( `${baseModDir}/Reddit` );
const { Twitter } = require( `${baseModDir}/Twitter` );
const { Stats } = require( `${baseModDir}/Stats` );
const { Vote } = require( `${baseModDir}/Vote` );
const fs = require( "fs" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Charge les modules dans le client.
 * @param {Client} client Le client du bot.
 */
async function loadModules( client ) {
	let modules = JSON.parse( fs.readFileSync( `${process.cwd()}/data/modules.json` ) );

	// Chargement des modules dans le client.
	client.modules.set( 'feed', new Feed( client, modules['feed'] ) );
	client.modules.set( 'levels', new Levels( client, modules['levels'] ) );
	client.modules.set( 'likes', new Likes( client, modules['likes'] ) );
	client.modules.set( 'logs', new Logs( client, modules['logs'] ) );
	client.modules.set( 'moyenne', new Moyenne( client ) );
	client.modules.set( 'reposts', new Reposts( client, modules['reposts'] ) );
	client.modules.set( 'reddit', new Reddit( client, modules['reddit'] ) );
	client.modules.set( 'stats', new Stats( client, modules['stats'] ) );
	client.modules.set( 'threads', new Threads( client, modules['threads'] ) );
	client.modules.set( 'twitter', new Twitter( client, modules['twitter'] ) );
	client.modules.set( 'vote', new Vote( client, modules['vote'] ) );
}


/**
 * Charge les commands dans le client.
 * Les commands doivent être dans des sous-dossiers du dossier 'commands'.
 * @param {Client} client Le client qui reçoit les commands.
 */
async function loadCommands( client ) {
	const dir = process.cwd() + "/commands"

	// Reading the commands' folders.
	fs.readdirSync( dir ).forEach( sub_dir => {
		// Reading the commands in the current folder.
		const commandFiles = fs.readdirSync( `${dir}/${sub_dir}` ).filter( file => file.endsWith( ".js" ) );

		for ( const file of commandFiles ) {
			// Using another pathname because require works from the current file path and not the project path.
			const command = require( `${dir}/${sub_dir}/${file}` );
			client.commands.set( command.data.name, command );
		}
	});
}


/**
 * Charge les évènements dans le client.
 * @param {Client} client Le client qui reçoit les évènements.
 */
async function loadEvents( client ) {
	const dir = process.cwd() + "/events"

	// Reading the events' files.
	const eventFiles = fs.readdirSync( dir ).filter(file => file.endsWith('.js'));
	for ( const file of eventFiles ) {
		const event = require( `${dir}/${file}` );
		if ( event.once ) {
			client.once( event.name, ( ...args ) => event.execute( ...args, client ) );
		} else {
			client.on( event.name, ( ...args ) => event.execute( ...args, client ) );
		}
	}
}


/**
 * Charge les commands dans la guild spécifiée.
 * @param {Client} client Le client du bot.
 * @param {string} guildId L'identifiant de la guild visée.
 */
async function loadCommandsToGuild( client, guildId ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	try {
		await client.guilds.cache.get( guildId ).commands.set( commandsArray );
	} catch( err ) {}

	console.log( `Commandes chargées dans la guild ${guildId} !` );
}


/**
 * Charge les commands dans toutes les guilds du client.
 * Les commands peuvent mettre jusqu'à une heure avant d'être disponible sur tout les serveurs.
 * @param {Client} client Le client du bot.
 */
/*async function loadCommandToAllGuilds( client ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	await client.application.commands.set( commandsArray );

	client.guilds.cache.forEach( (value, key) => {
		loadCommandsToGuild( client, key )
			.then();
	});
	console.log(
		"Commandes chargées ! Il peut y avoir un délai d'une heure avant que les commands soient disponible " +
		"sur toutes les guilds."
	);
}*/


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	loadCommands,
	loadEvents,
	loadModules,
	loadCommandsToGuild
}
