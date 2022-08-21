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
	 * @return {Promise<boolean>} Un booléen indiquant si le message a été supprimé.
	 */
	async ajouterThread( message, salon ) {
		if ( !this._active ) return false;
		if ( !salon ) return false;
		if ( !salon["b_threads"] ) return false;
		if ( message.author.id === this.client.id ) return false;

		const author = await (await this.client.guilds.fetch( message.guildId )).members.fetch( message.author.id );

		if ( !Memes.hasMeme( message ) ) {
			if ( Threads.isUserAdmin( author ) ) return true;
			await message.delete();
			return true;
		}

		let embedTitle = `Commentaires ┃ ${message.author.username}`;
		if ( message.content ) embedTitle += " • " + message.content.substring( 0, 100 - 3 - embedTitle.length );
		await message.startThread({
			name: embedTitle,
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