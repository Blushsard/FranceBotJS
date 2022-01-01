/**
 * @author Benjamin Guirlet
 * @file
 *		L'évènement 'ready' permet de lancer des fonctionnalités tournant h24 en background ainsi que de charger des
 *		permisssions, etc.
 */


const { Client } = require( "discord.js" );
const { GUILD_ID, MODERATOR_ROLE } = require("../files/config.json");

const { calcLikesAverage } = require( "../scheduledLoops/likesAverageCalculation" );
const { feed } = require( "../scheduledLoops/feed" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
async function execute( client ) {
	console.log( `${client.user.username} is connected!` );

	// Démarrage des fonctionnalités.
	await calcLikesAverage();
	await feed( client );

	// Décommenter quand il faudra update les permissions des commandes.
	// await loadPermissions( client )
}


/**
 * Cette fonction permet de charger les permissions des commandes.
 * @param {Client} client Le client du bot.
 */
async function loadPermissions( client ) {
	const permission = [
		{
			id: MODERATOR_ROLE,
			type: "ROLE",
			permission: true
		}
	]
	await client.guilds.cache.get( GUILD_ID ).commands.fetch();
	await client.guilds.cache.get( GUILD_ID ).commands.cache.forEach( command => {
		if ( client.commands.get( command.name ).adminsOnly )
			command.permissions.add( { permissions: permission } );
	});
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "ready",
	execute
}