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
			"SELECT * FROM LikesAverage;"
		))[0];

		// Récupération du nombre de message à prendre en compte dans la moyenne.
		const nbLikesMsg = (await query(
			`SELECT sum(likes) AS sumLikes, count(likes) as nbMsg 
			FROM Messages ORDER BY LIKES LIMIT ${queryResult["nb_msg_average"]}`
		))[0];

		let average = nbLikesMsg["sumLikes"] != null ?
			(nbLikesMsg["sumLikes"] / nbLikesMsg["nbMsg"]) :
			queryResult["average_min"];

		if ( average < queryResult["average_min"] ) average = queryResult["average_min"];

		await query( "UPDATE LikesAverage SET average=?", [ average ] );

	}, 60_000);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	calcLikesAverage
}