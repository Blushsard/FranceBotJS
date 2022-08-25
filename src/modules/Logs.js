/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant les logs du bot.
 */
const { MessageEmbed } = require("discord.js");


class Logs
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

		this._logChannelId = null;
		this.db.channelsManager.fetchOneChannelByValue( "b_logs", true )
			.then( value => {
				value ? this._logChannelId = value["pk_id_channel"] : null;
			});
	}

	set active( active ) { this._active = active; }
	set logChannelId( id ) { this._logChannelId = id; }

	get active() { return this._active; }

	/**
	 * Envoi l'embed d'un log dans le salon des logs.
	 * @param {MessageEmbed} embed L'embed du log.
	 * @param {string} guildId L'identifiant de la guild contenant le salon des logs.
	 */
	async sendEmbed( embed, guildId ) {
		const guild = await this.client.guilds.fetch( guildId );
		const logChannel = await guild.channels.fetch( this._logChannelId )
		try {
			await logChannel.send({ embeds: [ embed ] } );
		}
		catch ( err ) {
			console.log( err );
		}
	}

	/**
	 * Log envoyé quand un message est envoyé dans un salon de memes (likes).
	 * @param {Message} message Le message qui vient d'être envoyé.
	 */
	async messageMemeEnvoye( message ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme envoyé dans un salon." )
			.setURL( message.url )
			.setColor( process.env.COUL_EMBED_MEME )
			.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
			.addFields([
				{ name: "Salon :", value: `${message.channel}` },
				{ name: "Lien du message :", value: `[Accès au message](${message.url})` },
				{ name: "Date :", value: `${new Date()}` }
			])

		await this.sendEmbed( embed, message.guildId );
	}

	/**
	 * Log envoyé quand un message dans un salon de memes (likes) est supprimé.
	 * @param {Message} message Le message venant d'être supprimé.
	 */
	async memeSupprime( message ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme supprimé" )
			.setColor( process.env.COUL_EMBED_SUPP );

		if ( message.author ) {
			embed
				.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
				.addFields([
					{ name: "Salon :", value: `${message.channel}` }
				]);
		}
		embed.addFields([ { name: "Date :", value: `${new Date()}` } ]);

		await this.sendEmbed( embed, message.guildId );
	}

	/**
	 * Log envoyé quand un message est supprimé par repost.
	 * Ce log est envoyé avant le log de suppression de message. Les informations de ce log sont donc moindre qu'un
	 * log de suppression de message car le log suivant contiendra les informations nécessaires.
	 */
	async repostSupprime() {}

	/**
	 * Log envoyé quand un message est envoyé dans le feed ou sur reddit ou sur twitter.
	 */
	async memeEnvoye() {}

	/**
	 * Log envoyé quand la boucle de reddit ou twitter fait une itération.
	 * Le feed n'est pas danc ce log car il tourne toutes les secondes.
	 */
	async iteractionModule() {}

	/**
	 * Log envoyé quand un like ou un repost est ajouté/enlevé d'un message contenant des memes.
	 */
	async modificationVote() {}
}


module.exports = {
	Logs
}