/**
 * @author Benjamin Guirlet
 * @description
 *      Contient des fonctions permettant de récupérer la date ou la date convertie en int.
 */


/**
 * Retourne un entier généré avec la date prenant en compte l'année et le mois.
 * Calcul: année + mois * 12
 * @returns {number} L'entier généré.
 */
function getMonthlyIntDate() {
	const date = new Date();
	return date.getFullYear() * 12 +
		( date.getMonth() + 1 );
}


module.exports = {
	getMonthlyIntDate
}
