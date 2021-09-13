/**
 * @author Benjamin Guirlet
 * @description
 * 		This file contains all the database related functions.
 * 		The client use the module 'mysql' to work with the database.
 *
 * 		It is recommended to import the file with:
 * 			const sqlUtils = require( './utils/db_function' );
 * 		It allows the user to know more easily from where the functions are.
 */


const mysql = require( "mysql2/promise" );
const { HOST, USER, PASSWORD, DATABASE } = require( "../files/config.json" )


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Return a connection to the client's database.
 * @return {Promise<mysql.Connection>} A promise that is fulfilled with a mysql.Connection object.
 */
async function getConnection() {
	return ( await mysql.createConnection({
			host: HOST,
			user: USER,
			password: PASSWORD,
			database: DATABASE
		}
	));
}


/**
 * Execute the query passed as a parameter and return the results.
 * @param {string} query - The MySQL query to execute.
 * @param {array} [params] - An array containing the query's parameters.
 * @returns {Promise<array>} A Promise that is fulfilled with an array of the results of the passed query.
 */
async function query( query, params = [] ) {
	// Connecting to the database.
	const cnx = await getConnection();

	// Executing the query.
	const [ rows ] = await cnx.execute( query, params);
	await cnx.end();

	return rows ;
}


/**
 * Retrieves from the table MRChannels a channel.
 * @param {string} channelID The TextChannel discord ID.
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the query's result.
 */
async function getChannel( channelID ) {
	return await query(
		"SELECT * FROM Channels WHERE channel_id=?;",
		[channelID]
	);
}


/**
 * This function returns all the channels that correspond to the passed type.
 * @param {string} type The type of the channel(s) we want (memes, repost, feed, logs, stats).
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the request's results.
 */
async function getTypeChannel( type ) {
	return await query(
		`SELECT * FROM Channels WHERE ${type}=true;`
	);
}



/**
 * Add a channel to the MRChannels database.
 * @param {string} channelID The TextChannel's discord ID.
 */
async function addChannel( channelID ) {
	await query(
		"INSERT INTO Channels VALUES (?, ?, ?, ?, ?, ?);",
		[channelID, false, false, false, false, false]
	);
}


/**
 * Update a channel already present in the database.
 * @param {string} channelID The channel discord ID.
 * @param {string} columnName The name of the column to update.
 * @param {boolean} value The new value of the column.
 */
async function updateChannel( channelID, columnName, value ) {
	// Checking the array's length to know is the channel is already in the database.
	if ( !(await getChannel( channelID )).length )
		await addChannel( channelID );

	await query(
		`UPDATE Channels SET ${columnName}=? WHERE channel_id=?;`,
		[value, channelID]
	);
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	query,
	updateChannel,
	getTypeChannel
}