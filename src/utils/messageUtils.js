/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains functions used to manage and process messages' data.
 */


const { Message, MessageAttachment } = require( "discord.js" );
const { WEBSITES } = require( "../files/config.json" );
const { query } = require( "sqlUtils" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Returns an array with all the links that are from memes' websites.
 * @param {Message} message A discord.Message object.
 * @returns {Promise<array[string]>} A Promise fulfilled with an array containing the memes' links.
 * 							 If there isn't any links, then the array is empty.
 */
async function getMemesLinks( message ) {
	let linksArray = [];
	for ( let wb of WEBSITES ) {
		let matches = message.content.match( wb );

		if ( matches ) {
			for ( let match of matches )
				linksArray.push( match );
		}

	}

	return linksArray;
}


/**
 * Returns the current date in an int with the following format :
 * 		year_number * 365 + month_number * 12 + day_number
 * @returns {int} The day format date.
 */
function getDayFormatDate() {
	const date = new Date();
	return date.getFullYear() * 365 +
			( date.getMonth() + 1 ) * 12 +
			date.getDate();
}


/**
 * Returns the current date in an int with the following format :
 * 		year_number * 12 + month_number
 * @returns {int} The month format date.
 */
function getMonthFormatDate() {
	const date = new Date();
	return date.getFullYear() * 12 +
		( date.getMonth() + 1 );
}


/**
 * Add the message with its memes in the database.
 * @param {Message} message The discord.Message object of the message.
 * @param {int} likes The likes of the message. Can be more than 0 in some cases.
 * @param {int} reposts The reposts of the message. Can be more than 0 in some cases.
 * @param {array[string|MessageAttachment]} attachmentsArray The array with the message's memes.
 */
async function addMemeToDatabase( message, likes, reposts, attachmentsArray ) {
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
			getDayFormatDate(),
			getMonthFormatDate(),
			false,
			false,
			false
		]
	);


	for ( let attachment in attachmentsArray ) {
		await query(
			"INSERT INTO Attachments VALUES (?,?,?,?,?);",
			[
				message.id,
			]
		)
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	getMemesLinks
}