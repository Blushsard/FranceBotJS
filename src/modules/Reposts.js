/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de repost du bot.
 */

const { MessageReaction, User, MessageEmbed } = require( "discord.js" );


class Reposts
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
	 * Ajout l'emoji de repost si le salon est un salon de reposts.
	 * @param {object} salon L'objet de la db pour le salon.
	 * @param {Message} message Le message qui va recevoir l'emoji.
	 */
	async ajouterEmojiRepost( salon, message ) {
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( salon && !salon["b_reposts"] ) return;

		try {
			await message.react( process.env.EMOJI_REPOST );
		}
		catch ( err ) {}
	}

	/**
	 * Vérifie si un message dans un salon de repost ne dépasse pas la moyenne en repost.
	 * Si c'est le cas, alors le message est supprimé.
	 * @param {MessageReaction} reaction La reaction qui a été ajoutée sur le message.
	 * @param {object|null} salon L'objet contenant les données de la bdd du salon.
	 * @param {User} user L'utilisateur qui a ajouté la réaction.
	 * @param {boolean} upvote Indique si c'est un upvote ou downvote.
	 */
	async checkRepost( reaction, salon, user, upvote ) {
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( !salon["b_reposts"] ) return;
		if ( user.id === this.client.user.id ) return;
		if ( reaction.emoji.name !== process.env.EMOJI_REPOST ) return;

		// Protection pour éviter d'avoir des réactions "null" ou "undefined".
		// Cette erreur est présente dans FranceBotV3, l'appel de l'api ne contient pas les données de l'objet.
		if ( !reaction ) return;

		const moyenne = this.client.modules.get( "moyenne" ).getMoyenneRepost();

		// Récupération du nombre de reposts sur le message.
		let countReposts = 0;
		reaction.message.reactions.cache.forEach( reaction => {
			if ( reaction.emoji.name === process.env.EMOJI_REPOST )
				countReposts = reaction.count - 1;
		});

		const guild = await this.client.guilds.fetch( reaction.message.guildId );
		const guildMemberAuthor = await guild.members.fetch( user.id );
		await this.client.modules.get( "levels" ).supprimerExperienceRepostAjoute(
			guildMemberAuthor,
			reaction.message.channel,
			upvote
		);
		await this.client.modules.get( "logs" ).modificationVote(
			reaction.message,
			countReposts,
			true,
			process.env.EMOJI_REPOST,
			user
		);

		// Suppression du message si il y a trop de repost.
		if ( countReposts >= moyenne / 2 ) {
			await this.client.modules.get( "logs" ).repostSupprime();
			await this.client.modules.get( "stats" ).addRepostToStats();
			await this.client.modules.get( "levels" ).supprimerExperienceRepostSupprime( guildMemberAuthor, reaction.message.channel );
			await this.client.modules.get( "feed" ).deleteMessageFromFeed( reaction.message.id );
			await reaction.message.delete();

			const embed = new MessageEmbed()
				.setTitle( "Nous sommes désolés de vous annoncer qu'un de vos memes a dû être supprimé de FRANCE MEMES." )
				.setColor( "#2bcaff" )
				.addFields( [{
					name: "Ce dernier a été trop de fois signalé pour repost sur le serveur!",
					value: "But don’t give up your determination ! ^^"
				}]);

			try {
				await reaction.message.author.send({embeds: [embed]})
			}
			catch ( err ) {}
		}
	}
}


module.exports = {
	Reposts
}