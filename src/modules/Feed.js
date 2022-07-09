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
	 * @param {number} delay Le délai entre chaque intération du feed.
	 */
	async feed( delay ) {
		setInterval( async () => {
			if ( !this._active ) return;

			// Récupération du salon du feed si il existe.
			const feedChannelID = await this.db.channelsManager.fetchChannelByValue( "b_feed", true );
			if ( !feedChannelID.length ) return;
			const feedChannel = await this.client.channels.fetch( feedChannelID[0]["pk_id_channel"] );

			// Récupération de la moyenne et des messages de la base de données.
			const moyenne = this.client.modules.get( "moyenne" ).getMoyenne();
			let messages = await this.db.query(
				"SELECT * FROM messages WHERE b_stf=0 AND n_likes>=?",
				[ moyenne ]
			);

			// Traitement et envoi des messages dans le feed.
			for ( let msg of messages ) {
				const memes = await this.db.messagesManager.getMessageAttachments( msg["pk_msg_id"] );

				const author = this.client.users.cache.get( msg["s_author_id"] );
				if ( !author ) continue;

				const memeChannel = this.client.channels.cache.get( msg["s_channel_id"] );
				const firstEmbed = await this.sendMemesEmbeds( memes, feedChannel, author, memeChannel, msg['s_jump_url'] );
				await this.sendMessageToAuthor( author, firstEmbed );
				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_stf", true );
			}
		}, delay );
	}

	/**
	 * Envoi le message contenant les memes dans le feed.
	 * @param {array} memes La liste contenant les memes.
	 * @param {TextChannel} feedChannel Le salon du feed.
	 * @param {User} author L'auteur du message contenant les memes.
	 * @param {TextChannel} memeChannel Le salon dans lequel a été envoyé le message contenant les memes.
	 * @param {string} jumpUrl L'url du message contenant les memes.
	 * @return {Message} Le premier embed qui a été envoyé.
	 */
	async sendMemesEmbeds( memes, feedChannel, author, memeChannel, jumpUrl ) {
		let firstEmbed = null;
		let embed;
		for ( let meme of memes ) {
			embed = new MessageEmbed()
				.setAuthor({ name: `| ${author.username}`, iconURL: author.avatarURL() })
				.addField( "Lien du message", `[Accès au message](${jumpUrl})` )
				.addField( "Dans", `${memeChannel} de la catégorie: ${memeChannel.parent.name}` )
				.setColor( "#2bcaff" );

			if ( meme["s_type"] === "lien" )
				embed.setURL( meme["s_url"] ).setTitle( "Lien du meme" );
			else if ( meme["s_type"].split( "/" )[0] === "image" )
				embed.setImage( meme["s_url"] );
			else if ( meme["s_type"].split( "/" )[0] === "video" )
				embed.setURL( jumpUrl ).setTitle( "Lien de la vidéo" );

			let msg = await feedChannel.send({ embeds: [ embed ] });
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
						.setTitle( "Un de vos meme a été envoyé dans le feed!" )
						.setURL( firstEmbed.url )
				]});
		}
		catch ( err ) {}
	}
}


module.exports = {
	Feed
}