/**
 * @author Benjamin Guirlet
 * @file
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
	return (await mysql.createConnection({
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


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	query
}