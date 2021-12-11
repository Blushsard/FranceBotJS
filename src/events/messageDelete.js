/**
 * @author Benjamin Guirlet
 * @description
 */


const { Message, Client } = require( "discord.js" );
const sqlUtils = require( "../utils/sqlUtils" );
// const { deleteThreads } = require("../utils/modules/threads.js")


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * The handler for the event 'messageDelete'.
 * It is called whenever an interaction is created.
 * It can be a button pressed, a slash command executed, etc.
 * @param {Message} message The message that triggered the event.
 * @param {Client} client The client that created the interaction.
 */
async function execute( message, client ) {
	const msg = await sqlUtils.fetchMessage( message.id );
	console.log( msg );
	if ( msg ) {
		await sqlUtils.removeMessage(message.id);
		console.log( "test")
	}
	// deleteThreads(message)
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageDelete",
	execute
}