/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains functions used to manage and process messages' data.
 */


const { Message, Client, MessageReaction } = require( "discord.js" );
const { WEBSITES, LIKE_EMOJI, REPOST_EMOJI } = require( "../files/config.json" );
const sqlUtils = require( "./sqlUtils" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Returns an array with all the links that are from memes' websites.
 * @param {Message} message A discord.Message object.
 * @returns {Promise<array[string]>} A Promise fulfilled with an array containing the memes' links.
 * 									 If there isn't any links, then the array is empty.
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
 * Returns true if the message has at least a meme.
 * @param {Message} message The message to check.
 * @returns {Promise<boolean>} Returns true if the message has at least a meme.
 */
async function hasMeme( message ) {
	for ( let wb of WEBSITES ) {
		let matches = message.content.match( wb );
		if ( matches ) {
			return true;
		}
	}

	return !!message.attachments.size;
}


/**
 * Add the message and its attachments to the database.
 * This function only do the treatments of the attachments, it call the sqlUtils.addMemeToDatabase() function
 * to add the message to the database.
 * @param {Message} message The message that will be added to the database.
 * @param {int} likes The number of likes on the message.
 * @param {int} reposts The number of reposts on the message.
 */
async function addMemeToDatabase( message, likes, reposts ) {
	let memesArray = await getMemesLinks( message );
	message.attachments.forEach( value => {
		memesArray.push( value );
	});

	await sqlUtils.sendMemeToDatabase( message, 0, 0, memesArray );
}


/**
 * Updates the reaction (like/repost) count on a message if it is in the database.
 * @param {MessageReaction} reaction The reaction that triggered the event.
 * @param {User} user The user that added the reaction.
 * @param {Client} client The client's object.
 */
async function updateMessageReactions( reaction, user, client ) {
	// Checking if the bot is at the origin of the event.
	if ( user.id === client.id ) return;


	const messageDb = await sqlUtils.fetchMessage( reaction.message.id );
	const channel = await sqlUtils.fetchChannel( reaction.message.channelId );

	let emojiType;
	if ( channel["memes"] ) {
		if ( reaction.emoji.name === LIKE_EMOJI )
			emojiType = "likes";
		else if ( reaction.emoji.name === REPOST_EMOJI )
			emojiType = "repost"


		if ( messageDb ) {
			await sqlUtils.updateMessage(
				messageDb[0]["msg_id"],
				emojiType,
				reaction.count - 1
			)
		}
		else {
			await reaction.fetch();
			client.emit( "messageCreate", reaction.message );
		}
	}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	addMemeToDatabase,
	hasMeme,
	updateMessageReactions
}