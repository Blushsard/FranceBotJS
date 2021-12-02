/**
 * @author Benjamin Guirlet
 * @description
 *		This event is used to store the memes in the database and add their initial reactions.
 */


const sqlUtils = require( "../utils/sqlUtils" );
const msgUtils = require( "../utils/messageUtils" );
const { LIKE_EMOJI_MENTION, REPOST_EMOJI_MENTION } = require( "../files/config.json" );
const { Client, Message } = require( "discord.js" );
const { threads } = require("../utils/modules/threads.js")


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */


/**
 * Function called when the event 'messageCreate' is emitted.
 * @param {Message} message The message created.
 * @param {Client} client The client that emitted the event.
 */
async function execute( message, client ) {
	const channel = await sqlUtils.fetchChannel( message.channelId );
	if ( !channel )
		return;

	if ( channel["memes"] ) {
		const isAMeme = await msgUtils.addMemeToDatabase( message, 0, 0 );
		if ( isAMeme ) {
			await message.react( LIKE_EMOJI_MENTION );
			await message.react( REPOST_EMOJI_MENTION );
		}
	}

	// Out-comment the following line when reworking the threads with the no-messages rule in memes channels.
	// It needs a rework as it comes from another bot.
	// The file threads.js will also be removed from the utils folder and a new folder "modules" will be create at the
	// same level as the commands/events folders. Modules will be functionnalities such as Twitter, the threads, Reddit.
	// We will be able to enable/disable them from the file modules.js that may or may not need a rework.
	// A new command will be create to allow the management of the modules.
	// threads(message)

}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	name: "messageCreate",
	execute
}
