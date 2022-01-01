/**
 * @author Benjamin Guirlet
 * @file
 *      Ces fonctions permettent de générer des entiers par rapport à la date courante.
 */


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Retourne un entier généré avec la date courante avec une précision journalière:
 * 		année * 365 + numéro_mois * 12 + numéro_jour
 * @returns {int} L'entier généré.
 */
function getDayFormatDate() {
	const date = new Date();
	return date.getFullYear() * 365 +
		( date.getMonth() + 1 ) * 12 +
		date.getDate();
}


/**
 * Retourne un entier généré avec la date courante avec une précision mensuelle :
 * 		année * 12 + numéro_mois
 * @returns {int} The month format date.
 */
function getMonthFormatDate() {
	const date = new Date();
	return date.getFullYear() * 12 +
		( date.getMonth() + 1 );
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	getDayFormatDate,
	getMonthFormatDate
}