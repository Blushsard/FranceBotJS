/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant le système du feed.
 */
const { MessageEmbed, User, TextChannel } = require("discord.js");


class Feed
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
	 * Envoit les memes dans le feed toutes les X secondes.
	 * @param {string} delay Le délai entre chaque intération du feed.
	 */
	async feed( delay ) {
		setInterval( async () => {
			if ( !this._active ) return;

			// Récupération du salon du feed si il existe.
			const feedChannelID = await this.db.channelsManager.fetchOneChannelByValue( "b_feed", true );
			if ( !feedChannelID ) return;
			const feedChannel = await this.client.channels.fetch( feedChannelID["pk_id_channel"] );

			// Récupération de la moyenne et des messages de la base de données.
			const moyenne = this.client.modules.get( "moyenne" ).getMoyenne();
			let messages = await this.db.feedManager.fetchFeedQualifyingMessages( moyenne );

			// Traitement et envoi des messages dans le feed.
			for ( let msg of messages ) {
				const memes = await this.db.messagesManager.fetchMessageAttachments( msg["pk_msg_id"] );

				const author = this.client.users.cache.get( msg["s_author_id"] );
				if ( !author ) continue;

				// Le premier embed est récupérer pour envoyer le bon lien à l'auteur du message contenant les memes.
				const memeChannel = this.client.channels.cache.get( msg["s_channel_id"] );
				const firstEmbed = await this.sendMemesEmbeds( memes, feedChannel, author, memeChannel, msg );
				await this.sendMessageToAuthor( author, firstEmbed );
				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_stf", true );

				await this.client.modules.get( "levels" ).ajouterExperienceFeed( msg["s_author_id"] );
				await this.client.modules.get( "logs" ).memeEnvoyeDansFeed(
					await memeChannel.messages.fetch( msg["pk_msg_id"] ),
					firstEmbed.url
				);
			}
		}, Number( delay ) );
	}

	/**
	 * Envoi le message contenant les memes dans le feed.
	 * @param {array} memes La liste contenant les memes.
	 * @param {TextChannel} feedChannel Le salon du feed.
	 * @param {User} author L'auteur du message contenant les memes.
	 * @param {TextChannel} memeChannel Le salon dans lequel a été envoyé le message contenant les memes.
	 * @param {object} msgData Les donnees du msg provenant de la bdd.
	 * @return {Message} Le premier embed qui a été envoyé.
	 */
	async sendMemesEmbeds( memes, feedChannel, author, memeChannel, msgData ) {
		let firstEmbed = null;
		let embed;
		for ( let meme of memes ) {
			embed = new MessageEmbed()
				.setAuthor({ name: `| ${author.username}`, iconURL: author.avatarURL() })
				.addFields([
					{name: "Lien du message", value: `[Accès au message](${msgData["s_jump_url"]})`},
					{name: "Dans", value: `${memeChannel} de la catégorie: ${memeChannel.parent.name}`}
				])
				.setColor( "#2bcaff" );

			if ( meme["s_type"] === "lien" )
				embed.setURL( meme["s_url"] ).setTitle( "Lien du meme" );
			else if ( meme["s_type"].split( "/" )[0] === "image" )
				embed.setImage( meme["s_url"] );
			else if ( meme["s_type"].split( "/" )[0] === "video" )
				embed.setURL( msgData["jumpUrl"] ).setTitle( "Lien de la vidéo" );

			let msg = await feedChannel.send({ embeds: [ embed ] });

			// Lien entre le message et l'embed du feed dans la base de donnees.
			await this.db.feedManager.linkFeedToOriginMsg( msg.id, msgData["pk_msg_id"] );

			if ( !firstEmbed ) firstEmbed = msg;
		}
		return firstEmbed;
	}

	/**
	 * Envoi un message à l'utilisateur ayant envoyé les memes pour le prévenir que son message a été envoyé
	 * dans le feed.
	 * @param {User} author L'utilisateur ayant envoyé le message contenant les memes.
	 * @param {Message} firstEmbed Le premier embed envoyé pour les memes du message.
	 */
	async sendMessageToAuthor( author, firstEmbed ) {
		try {
			await author.send({ embeds: [
					new MessageEmbed()
						.setColor( "#2bcaff" )
						.setTitle( "Un de vos memes a été envoyé dans le feed !" )
						.setDescription( "Et vous avez reçu 50XP !" )
						.setURL( firstEmbed.url )
				]});
		}
		catch ( err ) { this.client.emit( "error", err ); }
	}

	/**
	 * Supprime tout les memes postés dans le feed provenant du message d'origine spécifié.
	 * @param {string} originMsgId L'id du message d'origine.
	 */
	async deleteMessageFromFeed( originMsgId ) {
		const feedChannelsId = await this.db.channelsManager.fetchChannelsByValue( "b_feed", true );

		// Parcours de tout les salons de feed du bot.
		for ( let feedChannelId of feedChannelsId ) {
			const feedChannel = await this.client.channels.fetch( feedChannelId["pk_id_channel"] );
			const linksFeedMsg = await this.db.feedManager.fetchLinks( "n_msg_id", originMsgId );

			// Suppression de tout les messages envoyés dans le feed actuel.
			for ( let link of linksFeedMsg ) {
				try {
					await feedChannel.messages.delete(link['pk_feed_msg_id']);
				} catch ( err ) {}
			}
			await this.db.feedManager.deleteRows( "n_msg_id", originMsgId );
		}
	}
}


module.exports = {
	Feed
}