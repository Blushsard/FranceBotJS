/**
 * @author Benjamin Guirlet
 * @description
 *      Cet évènement permet d'indiquer quand le bot atteint la limite de requêtes par seconde avec l'api discord.
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