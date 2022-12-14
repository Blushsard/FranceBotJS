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


class Likes
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
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( !salon["b_likes"] ) return;
		if ( !Likes.hasMeme( message ) ) return;
		if ( message.author.id === this.client.id ) return;

		// Récupération des memes du message (liens puis pièce-jointes).
		let memes = await this.getMemesLinks( message );
		message.attachments.forEach(value => {
			memes.push( value );
		});

		await this.db.messagesManager.ajouterMessage( message, memes, likes );
		await this.client.modules.get( "logs" ).messageMemeAjoute( message );

		try {
			await message.react( process.env.EMOJI_LIKE_ID );
		}
		catch ( err ) {}
	}

	/**
	 * Modifie le compte de likes sur un meme.
	 * @param {MessageReaction} reaction La reaction qui a été ajoutée sur le message.
	 * @param {object|null} salon L'objet contenant les données de la bdd du salon.
	 * @param {User} user L'utilisateur qui a ajouté la réaction.
	 * @param {boolean} upvote Indique si l'event ajoute ou retire une reaction au message.
	 */
	async updateLikeCount( reaction, salon, user, upvote ) {
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( !salon["b_likes"] ) return;
		if ( user.id === this.client.user.id ) return;
		if ( reaction.emoji.id !== process.env.EMOJI_LIKE_ID ) return;

		let msgDb = await this.db.messagesManager.fetchMessage( reaction.message.id );
		let likes;

		if ( msgDb ) {
			likes = this.getCountLikes( reaction.message.reactions.cache );
			await this.db.messagesManager.updateLikesCount( reaction.message.id, likes );
		}
		else {
			// On ajoute d'abord le message dans la base de données afin que le bot ajoute les reactions au message.
			// Cela permet de ne pas fausser le compte des likes.
			const channel = this.client.channels.cache.get( salon["pk_id_channel"] );
			const message = await channel.messages.fetch( reaction.message.id );
			await this.ajouterMessageMeme( message, salon, 0 );

			likes = this.getCountLikes( message.reactions.cache );
			await this.db.messagesManager.updateLikesCount( reaction.message.id, likes );
			msgDb = await this.db.messagesManager.fetchMessage( reaction.message.id );
		}

		// Ajout de l'exp pour l'ajout d'un like.
		const levels = await this.client.modules.get( "levels" );
		await levels.ajouterExperienceLikeAjoute( user.id, reaction.message.channel, upvote );
		try {
			await levels.ajouterExperienceLikeRecu( msgDb["s_author_id"], msgDb["s_channel_id"], user.id, upvote );
		} catch ( err ) { this.client.emit( "customError", "L'objet 'msgDb' est null ! (Likes:104)" ); }

		await this.client.modules.get( "logs" ).modificationVote(
			reaction.message,
			likes,
			upvote,
			process.env.EMOJI_LIKE_STRING,
			user
		);
	}


	/**
	 * Met à jour le message (voir si il faut faire des fonctions séparées pour update le texte ou les attachments).
	 * @param {Message} message
	 */
	updateMessageContent( message ) {
		// TODO à faire pour plus tard.
	}

	/**
	 * Retourne vrai si le message contient au moins 1 meme (lien ou pièce-jointe).
	 * @param {Message} message Le message à vérifier.
	 * @returns {boolean} Vrai si le message contient au moins un meme.
	 */
	static hasMeme( message ) {
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
			if ( reaction.emoji.id === process.env.EMOJI_LIKE_ID )
				likes = reaction.count - 1;
		});
		if ( likes < 0 ) likes = 0;
		return likes ? likes : 0;
	}
}


module.exports = {
	Likes
}