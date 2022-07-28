/**
 * @author Benjamin Guirlet
 * @description
 *      Permet d'afficher les erreurs de l'API discord.
 */

/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Event appelé lorsque le bot est connecté.
 * @param {Error} error L'erreur envoyée par l'API.
 */
async function execute( error ) {
	if ( !error ) return;
	console.log( error );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "error",
	execute
}