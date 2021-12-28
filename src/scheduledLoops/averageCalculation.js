/**
 * @author Benjamin Guirlet
 * @file
 *		This file contains the average calculation.
 *		It is started once the bot is ready.
 */


const { query } = require( "../utils/sqlUtils" );


async function calcAverage() {
	setInterval( async () => {
		const queryResult = (await query(
			"SELECT * FROM Average;"
		))[0];

		const likesMsg = (await query(
			`SELECT sum(likes) AS sumLikes, count(likes) as nbMsg 
			FROM Messages ORDER BY LIKES LIMIT ${queryResult["nb_msg_average"]}`
		))[0];

		let average = likesMsg["sumLikes"] != null ?
			(likesMsg["sumLikes"] / likesMsg["nbMsg"]) :
			queryResult["average_min"];

		if ( average < queryResult["average_min"] ) average = queryResult["average_min"];

		await query( "UPDATE Average SET average=?", [ average ] );

	}, 60_000);
}


module.exports = {
	calcAverage
}