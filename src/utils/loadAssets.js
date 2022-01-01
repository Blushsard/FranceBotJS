/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient les fonctions permettant de charger les commandes dans le client et dans les guilds sur
 * 		lesquelles le client se trouve.
 */


const { Client } = require( "discord.js" );

// Les 3 require suivant permettent de récupérer tout les chemins des commandes et events.
const { promisify } = require( "util" );
const { glob } = require( "glob" );
const globPromise = promisify( glob );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Charge les commandes dans le client.
 * @param {Client} client Le client qui reçoit les commandes.
 */
async function loadCommands( client ) {
	const files = await globPromise( `${process.cwd()}/commands/*/*.js` );
	files.map( file => {
		const command = require( file );
		client.commands.set( command.data.name, command );
	});
}


/**
 * Charge les évènements dans le client.
 * @param {Client} client Le client qui reçoit les évènements.
 */
async function loadEvents( client ) {
	const files = await globPromise( `${process.cwd()}/events/*.js` );
	files.map( file => {
		const event = require( file );
		if ( event.once )
			client.once( event.name, ( ...args ) => event.execute( ...args, client ) );
		else
			client.on( event.name, ( ...args ) => event.execute( ...args, client ) );
	});
}


/**
 * Charge les commandes dans la guild spécifiée.
 * @param {Client} client Le client du bot.
 * @param {string} guildId L'identifiant de la guild visée.
 */
async function loadCommandsToGuild( client, guildId ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	await client.guilds.cache.get( guildId ).commands.set( commandsArray );
	console.log( `Commandes chargées dans la guild ${guildId} !` );
}


/**
 * Charge les commandes dans toutes les guilds du client.
 * Les commandes peuvent mettre jusqu'à une heure avant d'être disponible sur tout les serveurs.
 * @param {Client} client Le client du bot.
 */
async function loadCommandToAllGuilds( client ) {
	const commandsArray = [];
	client.commands.map( command => {
		commandsArray.push( command.data.toJSON() );
	});

	await client.application.commands.set( commandsArray );
	console.log(
		"Commandes chargées ! Il peut y avoir un délai d'une heure avant que les commandes soient disponible " +
		"sur toutes les guilds."
	);

}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	loadCommands,
	loadEvents,
	loadCommandsToGuild
}
