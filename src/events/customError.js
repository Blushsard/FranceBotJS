/**
 * @author Benjamin Guirlet
 * @description
 *      Permet d'afficher des erreurs customisées.
 */

const { Client } = require( "discord.js" );
const { ADMINISTRATORS } = require( `${process.cwd()}/data/config.json` );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Event appelé lorsque le bot est connecté.
 * @param {string} error L'erreur envoyée par l'API.
 * @param {Client} client Le client du bot.
 */
async function execute( error, client ) {
	if ( !error ) return;

	const guild = await client.guilds.fetch( process.env.GUILD_ID );
	for ( let admin of ADMINISTRATORS ) {
		let adminUser = await guild.members.fetch( admin );
		await adminUser.send(
			"=".repeat( 100 ) + "\n" +
			"**UNE ERREUR EST SURVENUE !**\n" +
			"**DATE : **" + new Date() + "\n" +
			"```" + error + "```"
		);
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "error",
	execute
}