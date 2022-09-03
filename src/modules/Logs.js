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
	 */
	async sendEmbed( embed ) {
		const logChannel = await this.client.channels.fetch( this._logChannelId );
		try {
			await logChannel.send({ embeds: [ embed ] } );
		}
		catch ( err ) { this.client.emit( "error", err ); }
	}

	/**
	 * Log envoyé quand un message est envoyé dans un salon de memes (likes).
	 * @param {Message} message Le message qui vient d'être envoyé.
	 */
	async messageMemeAjoute( message ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme ajouté dans la base de données." )
			.setURL( message.url )
			.setColor( process.env.COUL_EMBED_MEME )
			.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
			.addFields([
				{ name: "Salon :", value: `${message.channel}` },
				{ name: "Lien du message :", value: `[Accès au message](${message.url})` },
				{ name: "Date :", value: `${new Date()}` }
			])

		await this.sendEmbed( embed );
	}

	/**
	 * Log envoyé quand un message dans un salon de memes (likes) est supprimé.
	 * @param {Message} message Le message venant d'être supprimé.
	 * @param {object} databaseMessage Les données du message contenues dans la bdd.
	 */
	async memeSupprime( message, databaseMessage ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme supprimé." )
			.setColor( process.env.COUL_EMBED_SUPP )
			.addFields([
				{ name: "Salon :", value: `${message.channel}` }
			]);

		// Dans le cas ou l'objet de l'auteur est présent dans l'objet du message.
		if ( message.author && typeof message.author.username === 'string' )
			embed
				.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() });
		else {
			const guild = await this.client.guilds.fetch( process.env.GUILD_ID );
			const auteur = await guild.members.fetch( databaseMessage["s_author_id"] );
			embed
				.setAuthor({ name: auteur.nickname, iconURL: auteur.avatarURL() });
		}

		embed.addFields([ { name: "Date :", value: `${new Date()}` } ]);

		await this.sendEmbed( embed );
	}

	/**
	 * Log envoyé quand un message est supprimé par repost.
	 * Ce log est envoyé avant le log de suppression de message. Les informations de ce log sont donc moindre qu'un
	 * log de suppression de message car le log suivant contiendra les informations nécessaires.
	 */
	async repostSupprime() {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme supprimé pour respost." )
			.setColor( process.env.COUL_EMBED_REPOST )
			.setDescription( "Cet embed est complété avec l'embed de suppression de message suivant." );

		await this.sendEmbed( embed );
	}

	/**
	 * Log envoyé quand un message est envoyé dans le feed ou sur reddit ou sur twitter.
	 * @param {Message} message L'objet du message qui vient d'être envoyé dans le feed.
	 * @param {string} feedLink Le lien du premier embed qui a été envoyé dans le feed.
	 */
	async memeEnvoyeDansFeed( message, feedLink ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;
		if ( !message || !feedLink ) return;

		const embed = new MessageEmbed()
			.setTitle( "Meme envoyé dans le feed." )
			.setURL( message.url )
			.setColor( process.env.COUL_EMBED_FEED )
			.setAuthor( { name: message.author.username, iconURL: message.author.avatarURL() } )
			.addFields([
				{ name: "Lien du feed :", value: `[Accès au message](${feedLink})` },
				{ name: "Date :", value: `${new Date()}` }
			]);

		await this.sendEmbed( embed );
	}

	/**
	 * Log envoyé quand la boucle de reddit ou twitter fait une itération.
	 * Le feed n'est pas danc ce log car il tourne toutes les secondes.
	 * @param {string} moduleName Le nom du module qui vient de faire une intération.
	 */
	async iteractionModule( moduleName ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( `Itération de la boucle ${moduleName}.` )
			.setColor( process.env.COUL_EMBED_ITERATION )
			.setAuthor( { name: this.client.user.name, iconURL: this.client.user.avatarURL() } );

		await this.sendEmbed( embed );
	}

	/**
	 * Log envoyé quand un like ou un repost est ajouté/enlevé d'un message contenant des memes.
	 * @param {Message} message Le message qui a subit le changement de vote.
	 * @param {number} actualReactions Le nombre d'emoji sur le message.
	 * @param {boolean} upvote Indique si la reaction a été ajoutée ou retirée au message.
	 * @param {string} emoji L'emoji qui a subit le changement.
	 * @param {User} voteur L'utilisateur qui a ajouté le vote.
	 */
	async modificationVote( message, actualReactions, upvote, emoji, voteur ) {
		if ( !this._active ) return;
		if ( !this._logChannelId ) return;

		const embed = new MessageEmbed()
			.setTitle( `Modifications de vote : ${emoji}` )
			.setURL( message.url )
			.setColor( process.env.COUL_EMBED_VOTE )
			.setAuthor( { name: voteur.username, iconURL: voteur.avatarURL() } )
			.addFields([
				{ name: "Lien du message :", value: `[Accès au message](${message.url})` },
				{ name: "Type de vote :", value: upvote ? "Ajout d'une réaction" : "Retrait d'une réaction" },
				{ name: "Valeur de la réaction :", value: `${actualReactions}` },
				{ name: "Date :", value: `${new Date()}` }
			]);

		if ( message.author )
			embed.setFooter( { text: message.author.username, iconURL: message.author.avatarURL() } );

		await this.sendEmbed( embed );
	}
}


module.exports = {
	Logs
}