/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de likes du bot.
 *      Il interagit avec les évènement suivants:
 *      	- messageCreate
 *      	- messageDelete
 *      	- messageUpdate
 *      	- messageReactionAdd
 *      	- messageReactionRemove
 *
 *     Le système de repost a été décalé dans son propre module pour plus de modularité et d'autres améliorations
 *     futures si besoin.
 */

const { Message } = require( "discord.js" );
const { WEBSITES } = require( `${process.cwd()}/data/config.json` );


class Memes
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.client = client;
		this.db = this.client.db;
		this._active = active;
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }

	/**
	 * Ajoute un message dans la base de données si il contient au moins un meme.
	 * @param {Message} message Le message à potentiellement mettre dans la base de données.
	 * @param {object} salon Les données de la base de données du salon dans lequel le message a été envoyé.
	 * @param {int} likes Le nombre de likes du message.
	 */
	async ajouterMessageMeme( message, salon, likes ) {
		if ( salon && !salon["b_memes"] ) return;
		if ( !this.hasMeme( message ) ) return;

		await this.ajouterMemeDatabase( message, likes );
		await message.react( process.env.EMOJI_LIKE );
		await message.react( process.env.EMOJI_REPOST );
	}

	removeMessage( message ) {

	}

	updateCountEmoji( emoji, incrementValue ) {

	}

	/**
	 * Ajouter les attachments à la base de données.
	 * @param Message
	 */
	addAttachments( Message ) {

	}


	/**
	 * Met à jour le message (voir si il faut faire des fonctions séparées pour update le texte ou les attachments).
	 * @param message
	 */
	updateMessage( message ) {

	}

	/**
	 * Retourne vrai si le message contient au moins 1 meme (lien ou pièce-jointe).
	 * @param {Message} message Le message à vérifier.
	 * @returns {boolean} Vrai si le message contient au moins un meme.
	 */
	hasMeme( message ) {
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
	 * @param {Message} message Le message à ajouter sur la base de donnée.
	 * @param {int} likes Le nombre de likes sur le message. Est utile si le message a déjà des réactions likes.
	 */
	async ajouterMemeDatabase( message, likes ) {
		let memes = await this.getMemesLinks( message );
		message.attachments.forEach(value => {
			memes.push( value );
		});

		await this.db.messagesManager.ajouterMessage( message, memes, likes );
	}

	/**
	 * Retourne une liste contenant les liens provenant de sites enregistrés comme site de memes qui sont contenus dans le
	 * texte du message.
	 * @param {Message} message Le message contenant les liens à vérifier.
	 * @returns {Promise<array[string]>} Une promesse complétée avec la liste des liens des memes.
	 */
	async getMemesLinks( message ) {
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
}


module.exports = {
	Memes
}