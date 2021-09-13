/**
 * @author Benjamin Guirlet
 * @description
 *		Handler of the 'messageCreate' event.
 */


const sqlUtils = require( "../utils/sqlUtils" );
const msgUtils = require( "../utils/messageUtils" );
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

}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
