/**
 * @author Benjamin Guirlet
 * @description
 *      Cet évènement permet d'indiquer quand le bot atteint la limite de requêtes par seconde avec l'api discord.
 *      Il n'est pas utilisé pour le moment mais sera utile pour surveyer le nombre de requêtes du bot plus tard.
 */
const { RateLimitData } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour l'évènement.
 * @param {RateLimitData} rateLimit
 */
async function execute( rateLimit ) {
	if ( rateLimit.timeout > 1000 ) {
		console.log( "\033[31mRATE LIMIT\033[0m\nTimeout            : " + rateLimit.timeout + "ms" );
		console.log( `Route de la requête: ${rateLimit.route}` );
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "rateLimit",
	execute
}