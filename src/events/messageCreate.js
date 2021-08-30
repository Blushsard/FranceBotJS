/**
 * @author Benjamin Guirlet
 * @file
 *		Handler of the 'messageCreate' event.
 */


const sqlUtils = require( "../utils/sqlUtils" );
const { LISTEN_CHANNEL } = require( "../files/guid_data.json" );
const { LIKE_EMOJI, REPOST_EMOJI } = require( "../files/config.json" );
const { Client, Message } = require( "discord.js" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Function called when the event 'messageCreate' is emitted.
 * @param {Message} message The message created.
 * @param {Client} client The client that emitted the event.
 */
async function execute( message, client ) {
	if ( LISTEN_CHANNEL.includes( message.channelId ) ) {
		await sqlUtils.query(
			"INSERT INTO Memes VALUES (?, ?, ?);",
			[
				message.id,
				message.author.id,
				message.channelId
			]
		);
	}


	// Adding the likes and repost buttons.
	await message.react( LIKE_EMOJI );
	await message.react( REPOST_EMOJI );
}

/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
