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

	}
}

/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
