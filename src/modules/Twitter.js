/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant l'upload des memes sur Twitter.
 */

const { TwitterApi } = require( "twitter-api-v2" );
const { GuildMember } = require( "discord.js" );
const request = require( "request" );


class Twitter
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

		this.twitterApi = new TwitterApi({
			appKey: process.env.TWITTER_CONSUMER_KEY,
			appSecret: process.env.TWITTER_CONSUMER_SECRET,
			accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
			accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
		});
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }

	/**
	 * @param {string} delay Le délai entre chaque itération de la boucle.
	 */
	async twitter( delay ) {
		setInterval( async () => {
			if ( !this._active ) return;

			// Récupération des messages qui peuvent être envoyés sur reddit.
			const messages = await this.db.query(
				"SELECT * FROM messages WHERE b_stf=1 AND b_stt=0 AND b_removed=0",
				[]
			);

			const guild = await this.client.guilds.fetch( process.env.GUILD_ID );

			// On itère sur chacun des messages.
			for ( let msg of messages ) {
				const attachments = await this.db.messagesManager.getMessageAttachments( msg["pk_msg_id"] );
				const author = await guild.members.fetch( msg["s_author_id"] );
				if ( !author ) continue;

				// Puis on itère sur les attachments pour les envoyer un par un.
				for ( let attachment of attachments ) {
					// On passe à l'itération suivante si le format n'est pas pris en charge par l'API de twitter.
					if ( !this.verifyFileType( attachment["s_type"] ) )
						continue;

					await this.sendPostToTwitter( msg, attachment, author );
				}
				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_stt", true );
			}

			await this.client.modules.get( "logs" ).iteractionModule( "Twitter" );
		}, Number( delay ) );
	}

	/**
	 * Envoi un post sur twitter.
	 * Le fichier est récupéré dans un buffer puis est envoyé sur reddit.
	 * Cela permet de ne pas stocker le fichier sur la machine exécutant le bot.
	 * @param {object} message Les données du message de la bdd.
	 * @param {object} attachment Les données de l'attachment de la bdd.
	 * @param {GuildMember} author L'auteur du message qui contient le meme.
	 */
	async sendPostToTwitter( message, attachment, author ) {
		request.head( attachment["s_url"], null, async (error, response) => {
			if ( !error && response.statusCode === 200 ) {
				let data = [];
				request.get( attachment["s_url"], null, null )
					.on( "data", chunk => {
						data.push( chunk );
					})
					.on( "end", async () => {
						const fileBuffer = Buffer.concat( data );
						const mediaId = await this.twitterApi.v1.uploadMedia( fileBuffer, {
							mimeType: attachment["s_type"]
						});
						await this.twitterApi.v2.tweet({
							text: this.prepareTextForPost( message["s_msg_content"], author ),
							media: {
								media_ids: [ mediaId ]
							}
						});
					});
			}
		});
	}

	/**
	 * Met en forme le texte pour un post twitter en enlevant les emojis et ajouter la phrase de fin.
	 * @param {string} text Le texte qui va être préparé.
	 * @param {GuildMember} author L'auteur du message contenant le meme.
	 * @return {string} Le texte préparé.
	 */
	prepareTextForPost( text, author ) {
		if ( text === "" ) return `Par ${author.nickname ?? author.user.username} sur #francememes`;

		const matches = text.match( "<a?:.{1,32}:\\d{18,24}>" );
		if ( matches ) {
			for ( let match of matches ) {
				text = text.replace( match, ":" + text.split( ":" )[1] + ":" );
			}
		}

		return text + `\nPar ${author.displayName} sur #francememes`;
	}

	/**
	 * Vérifie si le fichier du meme est bien pris en charge par l'API de twitter.
	 * @param {string} fileType Le type du fichier du meme.
	 * @returns {boolean} Un booléen indiquant si le type du fichier est pris en compte par l'API de twitter.
	 */
	verifyFileType( fileType ) {
		switch ( fileType ) {
			case "video/mp4":
			case "image/jpeg":
			case "image/gif":
			case "image/png":
			case "image/webp":
				return true;
		}
		return false;
	}
}


module.exports = {
	Twitter
}