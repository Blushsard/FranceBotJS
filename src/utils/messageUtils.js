/**
 * @author Benjamin Guirlet
 * @file
 *      Ce fichier contient toutes les fonctions liées à la gestion des messages.
 */


const { Message, Client, MessageReaction, User } = require( "discord.js" );
const { Collection } = require( "@discordjs/collection" );
const { WEBSITES, LIKE_EMOJI, REPOST_EMOJI } = require( `${process.cwd()}/files/config.json` );
const sqlUtils = require( "./sqlUtils" );


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Retourne une liste contenant les liens provenant de sites enregistrés comme site de memes qui sont contenus dans le
 * texte du message.
 * @param {Message} message Le message contenant les liens à vérifier.
 * @returns {Promise<array[string]>} Une promesse complétée avec la liste des liens des memes.
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
 * Retourne vrai si le message contient au moins 1 meme. Elle vérifie donc si le message contient au moins 1 lien
 * provenant d'un site de memes ou sinon, si le message à au moins une pièce-jointe.
 * @param {Message} message Le message à vérifier.
 * @returns {boolean} Vrai si le message contient au moins 1 meme (lien ou image/vidéo).
 */
function hasMeme( message ) {
	// On vérifie si le message à du texte pour éviter une erreur.
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
 * Cette fonction ajoute un message dans la base de données. Elle récupère donc tout les memes (liens et fichiers) avant
 * de l'envoyer sur la base de données.
 * @param {Message} message Le message à ajouté sur la base de donnée.
 * @param {int} likes Le nombre de likes sur le message. Est utile si le message a déjà des réactions likes.
 */
async function addMemeToDatabase( message, likes ) {
	let memesArray = await getMemesLinks(message);
	message.attachments.forEach(value => {
		memesArray.push(value);
	});

	await sqlUtils.sendMemeToDatabase(message, 0, memesArray);
}


/**
 * Met à jour le nombre de likes sur un message dans la base de données et vérifie le nombre de reposts sur ce message.
 * Si le message n'est pas dans la base de données et qu'il contient des memes, alors il est ajouté en émittant
 * l'évènement 'messageCreate'.
 * @param {MessageReaction} reaction La réaction qui a émit l'évènement.
 * @param {User} user L'utilisateur qui a ajouté l'évènement. Permet de vérifier si l'utilisateur n'est pas le bot.
 * @param {Client} client Le client du bot.
 */
async function updateMessageReactions( reaction, user, client ) {
	// Vérifie si le bot n'est pas l'utilisateur à l'origine de l'évènement.
	if ( user.id === client.user.id ) return;

	const channel = await sqlUtils.fetchChannel( reaction.message.channelId );
	const messageDb = await sqlUtils.fetchMessage( reaction.message.id );

	// Le salon doit être un salon de memes ou de reposts.
	if ( !channel && !channel["memes"] && !channel["reposts"] ) return;

	// Dans le cas où le message n'est pas dans le cache du client.
	if ( reaction.partial )
		await reaction.fetch();

	let { nbLikes, nbReposts } = getLikesAndReposts( reaction.message.reactions.cache );

	// On regarde si le message dépasse ou pas la moyenne en reposts.
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

	// On utilise l'évènement messageCreate pour ajouter un meme dans la base de données.
	if ( !messageDb )
		client.emit( "messageCreate", reaction.message );

	if ( channel["memes"] )
		await sqlUtils.updateMessage( reaction.message.id, "likes", nbLikes )
}


/**
 * Récupère le nombre de likes et de reposts sur un message.
 * @param {Collection} reactionsCache Une Collection contenant les réactions du message.
 * @returns {{nbLikes: number, nbReposts: number}} Deux entier représentant les likes et les resposts.
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