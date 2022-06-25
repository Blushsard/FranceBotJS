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

const { Message, MessageReaction, User } = require( "discord.js" );
const { Collection } = require( "@discordjs/collection" );
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
	 * @param {object|null} salon Les données de la base de données du salon dans lequel le message a été envoyé.
	 * @param {int} likes Le nombre de likes du message.
	 */
	async ajouterMessageMeme( message, salon, likes ) {
		if ( !salon ) return;
		if ( !salon["b_memes"] ) return;
		if ( !this._active ) return;
		if ( !this.hasMeme( message ) ) return;

		// Récupération des memes du message (liens puis pièce-jointes).
		let memes = await this.getMemesLinks( message );
		message.attachments.forEach(value => {
			memes.push( value );
		});
		await this.db.messagesManager.ajouterMessage( message, memes, likes );


		await message.react( process.env.EMOJI_LIKE );
		await message.react( process.env.EMOJI_REPOST );
	}

	/**
	 * Supprime un message et ses memes de la base de données.
	 * @param {string} messageId Le message à supprimer.
	 * @param {object|null} salon Les données de la base de données du salon dans lequel le message a été envoyé.
	 */
	async supprimerMessageMeme( messageId, salon ) {
		if ( !salon ) return;
		if ( !salon["b_memes"] ) return;
		if ( !this._active ) return;

		await this.db.messagesManager.supprimerMessage( messageId );
	}

	/**
	 * Modifie le compte de likes sur un meme.
	 * @param {MessageReaction} reaction La reaction qui a été ajoutée sur le message.
	 * @param {object|null} salon L'objet contenant les données de la bdd du salon.
	 * @param {User} user L'utilisateur qui a ajouté la réaction.
	 */
	async updateLikeCount( reaction, salon, user ) {
		if ( !salon ) return;
		if ( !salon["b_memes"] ) return;
		if ( !this._active ) return;
		if ( user.id === this.client.user.id ) return;
		if ( reaction.emoji.name !== process.env.EMOJI_LIKE ) return;

		if ( reaction.partial )
			await reaction.fetch();

		let likes = this.getCountLikes( reaction.message.reactions.cache );
		const msgDb = await this.db.messagesManager.updateLikesCount( reaction.message.id, likes );
		if ( msgDb ) return;

		// Ajout du message dans la base de données si il n'est pas dedans.
		const channel = this.client.channels.cache.get( salon["pk_id_channel"] );
		const message = await channel.messages.fetch( reaction.message.id );
		likes = this.getCountLikes( message.reactions.cache );
		await this.ajouterMessageMeme( message, salon, likes );
	}


	/**
	 * Met à jour le message (voir si il faut faire des fonctions séparées pour update le texte ou les attachments).
	 * @param {Message} message
	 */
	updateMessage( message ) {
		// TODO à faire pour plus tard.
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

	/**
	 * Récupère le nombre de likes sur un message.
	 * @param {Collection} reactionsCache Une Collection contenant les réactions du message.
	 * @return {int} Le nombre de likes.
	 */
	getCountLikes( reactionsCache ) {
		let likes = 0;
		reactionsCache.forEach( reaction => {
			if ( reaction.emoji.name === process.env.EMOJI_LIKE )
				likes = reaction.count - 1;
		});
		return likes ? likes : 0;
	}
}


module.exports = {
	Memes
}