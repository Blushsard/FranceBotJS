/**
 * @author Benjamin Guirlet
 * @description
 *      Cet évènement permet d'indiquer quand le bot atteint la limite de requêtes par seconde avec l'api discord.
 *      Il n'est pas utilisé pour le moment mais sera utile pour surveyer le nombre de requêtes du bot plus tard.
 */
const { RateLimitData, Client } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {RateLimitData} rateLimit
 * @param {Client} client Le client du bot.
 */
async function execute( rateLimit, client ) {
	if ( !rateLimit ) return;

	if ( rateLimit.timeout > 1000 ) {
		const message = "=".repeat( 100 ) + "\n" +
			":red_circle: **RATE LIMIT** :red_circle:\n" +
			`Timeout : ${rateLimit.timeout} ms\n` +
			`Route de la requête : ${rateLimit.route}\n` +
			`Heure du rateLimit : ${(new Date())}\n`;
		const guild = await client.guilds.fetch( process.env.GUILD_ID );
		let recipient = await guild.members.fetch( "268078126179942410" );
		try {
			await recipient.send( message );
		} catch( err ) { client.emit( "error", err ); }
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "rateLimit",
	execute
}