/**
 * @author Benjamin Guirlet
 * @file
 *		This file contains the average calculation.
 *		It is started once the bot is ready.
 */


const { query } = require( "../utils/sqlUtils" );


/**
 * Function calculating the average of likes from the n top messages in the database.
 * 'n' if stored in the 'LikesAverage' database.
 * It is an infinite while loop using setInterval as it needs to run 24h, 7d a week.
 */
async function calcLikesAverage() {
	setInterval( async () => {
		// Getting the average of likes, the average_min and the number of likes in the average.
		const queryResult = (await query(
			"SELECT * FROM LikesAverage;"
		))[0];

		// Getting the n top messages to calculate the average.
		const likesMsg = (await query(
			`SELECT sum(likes) AS sumLikes, count(likes) as nbMsg 
			FROM Messages ORDER BY LIKES LIMIT ${queryResult["nb_msg_average"]}`
		))[0];

		let average = likesMsg["sumLikes"] != null ?
			(likesMsg["sumLikes"] / likesMsg["nbMsg"]) :
			queryResult["average_min"];

		if ( average < queryResult["average_min"] ) average = queryResult["average_min"];

		await query( "UPDATE LikesAverage SET average=?", [ average ] );

	}, 60_000);
}


module.exports = {
	calcLikesAverage
}