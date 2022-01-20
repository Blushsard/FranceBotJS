/**
 * @author Benjamin Guirlet
 * @file
 *		Cette fonctionnalité calcule la moyenne des likes en prenant les N messages les plus likés dans la base de
 *		données.
 *		Le nombre de messages à prendre en compte dans la moyenne est stocké dans la table Moyenne.
 */


const { query } = require( "../utils/sqlUtils" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
async function calcLikesAverage() {
	const likesAverageLoop = setInterval( async () => {
		const queryResult = (await query(
			"SELECT * FROM Moyenne;"
		))[0];

		// Récupération de la somme des likes et du nombre de memes dans la moyenne.
		const nbLikesMsg = (await query(
			`SELECT sum(likes) AS sommeLikes, count(likes) as nbMsg 
			FROM Messages ORDER BY LIKES LIMIT ${queryResult["nb_msg_moyenne"]}`
		))[0];

		let average = nbLikesMsg["sommeLikes"] != null ?
			(nbLikesMsg["sommeLikes"] / nbLikesMsg["nbMsg"]) :
			queryResult["moyenne_min"];

		if ( average < queryResult["moyenne_min"] ) average = queryResult["moyenne_min"];

		await query( "UPDATE Moyenne SET moyenne=?", [ average ] );

	}, 60_000);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	calcLikesAverage
}