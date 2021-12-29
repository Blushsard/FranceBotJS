/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains functions used to manage and process messages' data.
 */


const { Message, Client, MessageReaction, User } = require( "discord.js" );
const { Collection } = require( "@discordjs/collection" );
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
 * @returns {boolean} Returns true if the message has at least a meme.
 */
function hasMeme( message ) {
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
 * @return boolean Returns a boolean indicating if the meme has been added to the database.
 */
async function addMemeToDatabase( message, likes ) {
	let memesArray = await getMemesLinks(message);
	message.attachments.forEach(value => {
		memesArray.push(value);
	});

	await sqlUtils.sendMemeToDatabase(message, 0, memesArray);
}


/**
 * Updates the reaction (like/repost) count on a message if it is in the database.
 * @param {MessageReaction} reaction The reaction that triggered the event.
 * @param {User} user The user that added the reaction.
 * @param {Client} client The client's object.
 */
async function updateMessageReactions( reaction, user, client ) {
	// Checking if the bot is at the origin of the event.
	if ( user.id === client.user.id ) return;

	const channel = await sqlUtils.fetchChannel( reaction.message.channelId );
	const messageDb = await sqlUtils.fetchMessage( reaction.message.id );

	// The channel needs to be at least a memes or reposts channel. Else we just leave the function;
	if ( !channel && !channel["memes"] && !channel["reposts"] ) return;

	// If the message was not in the client's cache.
	if ( reaction.partial )
		await reaction.fetch();

	let { nbLikes, nbReposts } = getLikesAndReposts( reaction.message.reactions.cache );

	// Checking if the message needs to be removed because of reposts.
	if ( channel["reposts"] ) {
		if ( nbReposts >= (await sqlUtils.getLikesAverage()) ) {
			if ( messageDb )
				await sqlUtils.removeMessage( messageDb["msg_id"] );
			await reaction.message.author.send(
				"Suite à des votes signalent votre message comme un reposts, ce dernier a été supprimé !"
			)
			await reaction.message.delete();
		}
	}

	// We use the messageCreate event to upload the message to the database in case it isn't in and it contains a meme.
	if ( !messageDb )
		client.emit( "messageCreate", reaction.message );

	// We update to ensure that the message in the database has the right number of likes.
	if ( channel["memes"] )
		await sqlUtils.updateMessage( reaction.message.id, "likes", nbLikes )
}


/**
 * Fetch the number of likes and reposts on a message.
 * @param {Collection} reactionsCache The cache with the message's reactions.
 * @returns {{nbLikes: number, nbReposts: number}} Two ints with respectively the likes and the reposts.
 */
function getLikesAndReposts( reactionsCache ) {
	let nbLikes = 0;
	let nbReposts = 0;
	reactionsCache.forEach( mReaction => {
		if ( mReaction.emoji.name === LIKE_EMOJI )
			nbLikes = mReaction.count - 1;
		else if ( mReaction.emoji.name === REPOST_EMOJI )
			nbReposts = mReaction.count;
	});

	return { nbLikes, nbReposts };
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	addMemeToDatabase,
	hasMeme,
	updateMessageReactions
}