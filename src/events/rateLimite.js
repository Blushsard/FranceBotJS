/**
 * @author Benjamin Guirlet
 * @description
 *      Cet évènement permet d'indiquer quand le bot atteint la limite de requêtes par seconde avec l'api discord.
 *      Il n'est pas utilisé pour le moment mais sera utile pour surveyer le nombre de requêtes du bot plus tard.
 */


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
async function execute( rateLimit ) {
	console.log( "\033[31mIMPORTANT\033[0m : " + rateLimit );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "rateLimit",
	execute
}