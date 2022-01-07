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
const dateUtils = require( "./dateUtils" );
const { HOST, USER, PASSWORD, DATABASE } = require( "../files/config.json" )
const { Message, MessageAttachment } = require( "discord.js" );


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
	await cnx.commit();
	await cnx.end();

	return rows ;
}


/* ----------------------------------------------- */
/* FUNCTIONS CHANNELS                              */
/* ----------------------------------------------- */
/**
 * Retrieves from the table MRChannels a channel.
 * @param channelID The TextChannel discord ID as a Snowflake or a String.
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the query's result
 * 							 if the channel is in the database, else it is fulfilled with 'null'.
 */
async function fetchChannel( channelID ) {
	const channel = await query(
		"SELECT * FROM Salons WHERE id_salon=?;",
		[channelID]
	);

	return channel.length ? channel[0] : null;
}


/**
 * Add a channel to the MRChannels database.
 * @param {string} channelID The TextChannel's discord ID.
 */
async function addChannel( channelID ) {
	await query(
		"INSERT INTO Salons VALUES (?, ?, ?, ?, ?, ?, ?);",
		[channelID, false, false, false, false, false, false]
	);
}


/**
 * Update a channel already present in the database.
 * The function will automaticaly disable the previous channel if the columnName is 'feed', 'logs' or 'stats'.
 * @param channelID The channel discord ID.
 * @param {string} columnName The name of the column to update.
 * @param {boolean} value The new value of the column.
 */
async function updateChannel( channelID, columnName, value ) {
	// Checking the array's length to know is the channel is already in the database.
	if ( !(await fetchChannel( channelID )) )
		await addChannel( channelID );

	if ( [ 'feed', 'logs', 'stats' ].includes( columnName ) && value )
	{
		const prevChannelId = await fetchChannelByValue( columnName, true );
		await query( `UPDATE Salons SET ${columnName}=0 WHERE id_salon=?`, [ prevChannelId ] );
	}
	await query( `UPDATE Salons SET ${columnName}=? WHERE id_salon=?;`, [value, channelID] );
}


/**
 * Fetch all the channels with a specified value in a specified column.
 * @param {string} columnName The specified column to check.
 * @param {boolean} value The required value.
 * @returns {Promise<array[object]>} Returns a promise fulfilled with an array of rows as objects.
 */
async function fetchChannelByValue( columnName, value ) {
	return await query( `SELECT * from Salons WHERE ${columnName}=?`, [ value ] );
}


/* ----------------------------------------------- */
/* FUNCTIONS MESSAGES                              */
/* ----------------------------------------------- */
/**
 * Add the message with its memes in the database.
 * @param {Message} message The discord.Message object of the message.
 * @param {int} likes The likes of the message. Can be more than 0 in some cases.
 * @param {array[string|MessageAttachment]} attachmentsArray The array with the message's memes.
 */
async function sendMemeToDatabase( message, likes, attachmentsArray ) {
	await query(
		"INSERT INTO Messages VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",
		[
			message.id,
			message.author.id,
			message.channelId,
			message.channel.parent.name,
			message.url,
			likes,
			message.content,
			dateUtils.getDayFormatDate(),
			dateUtils.getMonthFormatDate(),
			false,
			false,
			false
		]
	);

	let queryParams;
	for ( let element of attachmentsArray ) {
		if ( typeof element === "string" ) {
			queryParams = [
				message.id,
				"lien",
				"lien",
				element
			]
		}
		else {
			queryParams = [
				message.id,
				element.contentType.split( "/" )[0],
				element.name,
				element.url
			]
		}

		await query(
			"INSERT INTO Attachments VALUES (?,?,?,?);",
			queryParams
		)
	}
}


/**
 * Returns an array with the message's data if it is present in the table.
 * @param messageId The message's discord ID as a Snowflake or a String.
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the query's result.
 */
async function fetchMessage( messageId ) {
	const row = await query(
		"SELECT * FROM Messages WHERE msg_id=?;",
		[ messageId ]
	);

	return row.length ? row[0] : null;
}


/**
 * Fetch multiple messages from the table Messages with a filter. The filter has to be in the form of an SQL condition.
 * @param {string} filter The condition to apply to the request.
 * @returns {Promise<array[object]>} A promise fulfilled with an array the rows as objects.
 */
async function fetchMessages( filter ) {
	return await query( `SELECT * FROM Messages WHERE ${filter}` );
}


/**
 * Update a message row in the table Messages.
 * @param messageId The message's discord ID as a Snowflake or a String.
 * @param {string} udpType Which column to update.
 * @param udpValue The new value to put in the data cell.
 */
async function updateMessage( messageId, udpType, udpValue ) {
	await query(
		`UPDATE Messages SET ${udpType}=? WHERE msg_id=?;`,
		[ udpValue, messageId ]
	);
}


/**
 * Removes a messages and its attachments from the database.
 * @param messageId The message's discord ID.
 */
async function removeMessage( messageId ) {
	await query(
		"DELETE FROM Messages WHERE msg_id=?",
		[ messageId ]
	);

	await query(
		"DELETE FROM Attachments WHERE msg_id=?",
		[ messageId ]
	);
}


/* ----------------------------------------------- */
/* FUNCTIONS ATTACHMENTS                           */
/* ----------------------------------------------- */
/**
 * Fetch the attachments from a message.
 * @param {String} messageId The attachments' message ID.
 * @returns {Promise<array[object]>} Returns a promise fulfilled with an array of the attachments as objects.
 */
async function fetchAttachments( messageId ) {
	return await query(
		"SELECT * FROM Attachments WHERE msg_id=?",
		[ messageId ]
	);
}


/* ----------------------------------------------- */
/* FUNCTIONS LIKESAVERAGE                          */
/* ----------------------------------------------- */
async function getLikesAverage() {
	const row = await query( "SELECT moyenne from Moyenne;" );
	return row.length ? row[0]['average'] : null;
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	query,
	updateChannel,
	fetchChannel,
	fetchChannelByValue,

	sendMemeToDatabase,
	fetchMessage,
	fetchMessages,
	updateMessage,
	removeMessage,

	fetchAttachments,

	getLikesAverage
}