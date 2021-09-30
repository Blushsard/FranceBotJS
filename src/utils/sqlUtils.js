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
const dateUtils = require( "./dateUtils" );
const { HOST, USER, PASSWORD, DATABASE } = require( "../files/config.json" )
const { Message, MessageAttachment } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS CHANNELS                              */
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
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the query's result
 * 							 if the channel is in the database, else it is fulfilled with 'null'.
 */
async function fetchChannel( channelID ) {
	const channel = await query(
		"SELECT * FROM Channels WHERE channel_id=?;",
		[channelID]
	);

	if ( channel.length )
		return channel[0];
	else
		return null;
}


/**
 * This function returns all the channels that correspond to the passed type.
 * @param {string} type The type of the channel(s) we want (memes, repost, feed, logs, stats).
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the request's results.
 */
async function fetchChannelsByType( type ) {
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
	if ( !(await fetchChannel( channelID )) )
		await addChannel( channelID );

	await query(
		`UPDATE Channels SET ${columnName}=? WHERE channel_id=?;`,
		[value, channelID]
	);
}


/* ----------------------------------------------- */
/* FUNCTIONS MEMES                                 */
/* ----------------------------------------------- */
/**
 * Add the message with its memes in the database.
 * @param {Message} message The discord.Message object of the message.
 * @param {int} likes The likes of the message. Can be more than 0 in some cases.
 * @param {int} reposts The reposts of the message. Can be more than 0 in some cases.
 * @param {array[string|MessageAttachment]} attachmentsArray The array with the message's memes.
 */
async function sendMemeToDatabase( message, likes, reposts, attachmentsArray ) {
	await query(
		"INSERT INTO Memes VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",
		[
			message.id,
			message.author.id,
			message.channelId,
			message.channel.parent.name,
			likes,
			reposts,
			message.content,
			dateUtils.getDayFormatDate(),
			dateUtils.getMonthFormatDate(),
			false,
			false,
			false
		]
	);

	let queryParams;
	for ( let cpt = 0; cpt < attachmentsArray.length; cpt++ ) {
		let element = attachmentsArray[cpt];

		if ( typeof element === "string" ) {
			queryParams = [
				message.id,
				"lien",
				element,
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
			"INSERT INTO Attachments (msg_id, type, filename, link) VALUES (?,?,?,?);",
			queryParams
		)
	}
}


/**
 * Returns an array with the message's data if it is present in the table.
 * @param {string} messageId The message's discord ID.
 * @returns {Promise<array>} Returns a Promise fulfilled with an array containing the query's result.
 */
async function fetchMessage( messageId ) {
	const row = await query(
		"SELECT * FROM Memes WHERE msg_id=?;",
		[ messageId ]
	);

	return row.length ? row : null;
}


/**
 * Update a message row in the table Memes.
 * @param {string} messageId The message's discord ID.
 * @param {string} udpType Which column to update.
 * @param {int} udpValue The new value to put in the data cell.
 */
async function updateMessage( messageId, udpType, udpValue ) {
	switch ( udpType ) {
		case 'likes':
			await query(
			`UPDATE Memes SET ${udpType}=? WHERE msg_id=?;`,
			[ udpValue, messageId ]
			);
			break;
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	query,
	updateChannel,
	fetchChannel,
	fetchChannelsByType,
	sendMemeToDatabase,
	fetchMessage,
	updateMessage
}