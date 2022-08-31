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
	 * Vérifie si un message dans un salon de repost ne dépasse pas la moyenne en repost.
	 * Si c'est le cas, alors le message est supprimé.
	 * @param {MessageReaction} reaction La reaction qui a été ajoutée sur le message.
	 * @param {object|null} salon L'objet contenant les données de la bdd du salon.
	 * @param {User} user L'utilisateur qui a ajouté la réaction.
	 */
	async checkRepost( reaction, salon, user ) {
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( !salon["b_reposts"] ) return;
		if ( user.id === this.client.user.id ) return;
		if ( reaction.emoji.name !== process.env.EMOJI_REPOST ) return;

		// Protection pour éviter d'avoir des réactions "null" ou "undefined".
		// Cette erreur est présente dans FranceBotV3, l'appel de l'api ne contient pas les données de l'objet.
		if ( !reaction ) return;

		const moyenne = this.client.modules.get( "moyenne" ).getMoyenne();

		// Récupération du nombre de reposts sur le message.
		let countReposts = 0;
		reaction.message.reactions.cache.forEach( reaction => {
			if ( reaction.emoji.name === process.env.EMOJI_REPOST )
				countReposts = reaction.count - 1;
		});

		await this.client.modules.get( "logs" ).modificationVote(
			reaction.message,
			countReposts,
			true,
			process.env.EMOJI_REPOST
		);

		// Suppression du message si il y a trop de repost.
		if ( countReposts >= moyenne ) {
			await this.client.modules.get( "logs" ).repostSupprime();
			await this.client.modules.get( "stats" ).addRepostToStats();
			await reaction.message.delete();

			const embed = new MessageEmbed()
				.setTitle( "Nous sommes désolés de vous annoncer qu'un de vos memes a dû être supprimé de FRANCE MEMES." )
				.setColor( "#2bcaff" )
				.addField(
					"Ce dernier a été trop de fois signalé pour repost sur le serveur!",
					"But don’t give up your determination ! ^^"
				);

			try {
				await user.send({embeds: [embed]});
			}
			catch ( err ) { this.client.emit( "error", err ); }
		}
	}
}


module.exports = {
	Reposts
}