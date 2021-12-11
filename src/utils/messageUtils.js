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
	// Checking if there is a message content to avoid an error.
	if ( !!message.content ) {
		for ( let wb of WEBSITES ) {
			let matches = message.content.match(wb);
			if (matches) {
				return true;
			}
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
 * @return boolean Returns a boolean indicating if the meme has been added to the database.
 */
async function addMemeToDatabase( message, likes, reposts ) {
	if ( await hasMeme( message ) ) {
		let memesArray = await getMemesLinks(message);
		message.attachments.forEach(value => {
			memesArray.push(value);
		});

		await sqlUtils.sendMemeToDatabase(message, 0, 0, memesArray);
		return true;
	}
	return false;
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

	// If the message was not in the client's cache.
	if ( reaction.partial )
		await reaction.fetch();

	let messageDb = await sqlUtils.fetchMessage( reaction.message.id );
	if ( !messageDb )
		client.emit( "messageCreate", reaction.message );

	const channel = await sqlUtils.fetchChannel( reaction.message.channelId );
	if ( !channel ) return;

	if ( channel["memes"] || channel["reposts"] ) {
		let nbLikes = 0;
		let nbRepost = 0;
		reaction.message.reactions.cache.forEach( mReaction => {
			if ( mReaction.emoji.name === LIKE_EMOJI )
				nbLikes = mReaction.count - 1;
			else if ( mReaction.emoji.name === REPOST_EMOJI )
				nbRepost = mReaction.count - 1;
		});

		// We update to ensure that the message in the database has the right number of likes and reposts.
		await sqlUtils.updateMessage(
			reaction.message.id,
			"likes",
			nbLikes
		)
		await sqlUtils.updateMessage(
			reaction.message.id,
			"reposts",
			nbRepost
		)
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