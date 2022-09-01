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
function getMonthIntDate() {
	const date = new Date();
	return date.getFullYear() * 12 +
		( date.getMonth() + 1 );
}

function getMonthName() {
	return [
		"Janvier",
		"Février",
		"Mars",
		"Avril",
		"Mai",
		"Juin",
		"Juillet",
		"Août",
		"Septembre",
		"Octobre",
		"Novembre",
		"Décembre"
	][(new Date()).getMonth()];
}


module.exports = {
	getMonthIntDate,
	getMonthName
}
