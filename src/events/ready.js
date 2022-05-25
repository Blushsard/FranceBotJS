/**
 * @author Benjamin Guirlet
 * @file
 *		L'évènement 'ready' permet de lancer des fonctionnalités tournant h24 en background ainsi que de charger des
 *		permisssions, etc.
 */


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
async function execute( client ) {
	console.log( `${client.user.username} is connected!` );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "ready",
	execute
}