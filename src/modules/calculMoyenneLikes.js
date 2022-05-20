/**
 * @author Benjamin Guirlet
 * @file
 *		Cette fonctionnalité calcule la moyenne des likes en prenant les N messages les plus likés dans la base de
 *		données.
 *		Le nombre de messages à prendre en compte dans la moyenne est stocké dans la table Moyenne.
 */


const { query } = require( `${process.cwd()}/utils/sqlUtils` );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
async function calcLikesAverage() {
	setInterval( async () => {
		const queryResult = (await query(
			"SELECT * FROM Moyenne;"
		))[0];

		// Récupération de la somme des likes et du nombre de memes dans la moyenne.
		const nbLikesMsg = (await query(
			`SELECT sum(likes) AS sommeLikes, count(likes) as nbMsg 
			FROM Messages ORDER BY LIKES LIMIT ${queryResult["nb_msg_moyenne"]}`
		))[0];

		// Dans le cas ou le nombre de messages est à 0, on met la moyenne à 1 car elle est inutile tant qu'il n'y a pas
		// de messages. De plus, il y aura toujours des messages.
		let average = nbLikesMsg["sommeLikes"] != null
			? (nbLikesMsg["sommeLikes"] / nbLikesMsg["nbMsg"])
			: 1;

		await query( "UPDATE Moyenne SET moyenne=?", [ average ] );

	}, 60_000);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	calcLikesAverage
}