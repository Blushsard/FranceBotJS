/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de threads.
 *      Quand ce module est actif, les gens (autres que modos, etc) ne peuvent pas envoyer de messages dans les salons
 *      si ils ne contiennent pas de memes. Tout les messages de répondant pas à cette contrainte seront supprimés.
 *      Des threads sont donc créés en dessous de chaque message contenant un meme pour que les gens puissent en
 *      discuter.
 */

const { Message } = require( "discord.js" );
const { Memes } = require( `${process.cwd()}/modules/Likes` );


class Threads
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
	 * Ajoute un thread au message si il contient un ou des memes. Sinon le message est supprimé.
	 * @param {Message} message L'objet du message.
	 * @param {object} salon L'objet du salon contenant les données de la bdd.
	 * @return {boolean} Un booléen indiquant si le message a été supprimé.
	 */
	async ajouterThread( message, salon ) {
		if ( !this._active ) return;
		if ( !salon ) return;
		if ( !salon["b_threads"] ) return true;
		if ( message.author.id === this.client.id ) return;

		const author = await (await this.client.guilds.fetch( message.guildId )).members.fetch( message.author.id );
		if ( Threads.isUserAdmin( author ) ) return;

		if ( !Memes.hasMeme( message ) ) {
			await message.delete();
			return true;
		}

		await message.startThread({
			name: `Réponse | ${message.author.username} (${message.author.id})`,
			autoArchiveDuration: 1440,
			rateLimitPerUser: 60
		});
	}

	static isUserAdmin( member ) {
		return member.permissions.has( "MANAGE_MESSAGES", true ) || member.permissions.has( "ADMINISTRATOR", true );
	}
}


module.exports = {
	Threads
}