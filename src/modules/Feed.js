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
				// récupération des informations du message.
				const memes = await this.db.query(
					"SELECT * FROM attachments WHERE pk_msg_id=?",
					[ msg["pk_msg_id"] ]
				);

				const author = this.client.users.cache.get( msg["s_author_id"] );
				if ( !author ) continue;
				const memeChannel = this.client.channels.cache.get( msg["s_channel_id"] );

				const headerMessage = await this.sendHeaderMessage( author, memes.length, msg, memeChannel, feedChannel );
				await this.sendMemesMessage( memes, feedChannel );

				await this.sendMessageToAuthor( author, headerMessage );

				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_stf", true );
			}
		}, delay );
	}

	/**
	 * Envoi l'embed indiquant combien de memes sont envoyés pour un message.
	 * @param {User} author L'utilisateur qui a envoyé le message contenant les memes.
	 * @param {int} nbMemes Le nombre de memes dans le message.
	 * @param {object} msg L'objet du message contenant les données de la bdd.
	 * @param {TextChannel} memeChannel Le salon dans lequel le message a été envoyé.
	 * @param {TextChannel} feedChannel Le salon du feed.
	 * @return {Message} Le message contenant l'embed qui a été envoyé dans le feed.
	 */
	async sendHeaderMessage( author, nbMemes, msg, memeChannel, feedChannel ) {
		const firstEmbed = new MessageEmbed()
			.setAuthor({ name: `| ${author.username}`, iconURL: author.avatarURL() })
			.setTitle( `${nbMemes} meme(s) envoyé(s)!` )
			.addField( "Lien du message", `[Accès au message](${msg["s_jump_url"]})`  )
			.addField( "Dans", `<#${memeChannel.id}> de la catégorie: ${memeChannel.parent.name}` )
			.setColor( "#2bcaff" );

		return await feedChannel.send({ embeds: [ firstEmbed ] });
	}

	/**
	 * Envoi le message contenant les memes dans le feed.
	 * @param {array} memes La liste contenant les memes.
	 * @param {TextChannel} feedChannel Le salon du feed.
	 */
	async sendMemesMessage( memes, feedChannel ) {
		let memesURL = [];
		let msgContent = "";
		for ( let meme of memes ) {
			if ( meme["s_type"] === "attachment" )
				memesURL.push( meme["s_url"] );
			else
				msgContent += meme["s_url"] + "\n";
		}

		// Addition d'un espace pour éviter d'avoir une chaîne vide ce qui cause une erreur.
		msgContent += " ";

		await feedChannel.send({ content: msgContent, files: memesURL });
	}

	/**
	 * Envoi un message à l'utilisateur ayant envoyé les memes pour le prévenir que son message a été envoyé
	 * dans le feed.
	 * @param {User} author L'utilisateur ayant envoyé le message contenant les memes.
	 * @param {Message} headerMessage Le message contenant l'embed indiquant le début des memes d'un message.
	 */
	async sendMessageToAuthor( author, headerMessage ) {
		try {
			await author.send({ embeds: [
					new MessageEmbed()
						.setColor( "#2bcaff" )
						.setTitle( "Un de vos meme a été envoyé dans le feed!" )
						.setURL( headerMessage.url )
				]});
		}
		catch ( err ) {}
	}
}


module.exports = {
	Feed
}