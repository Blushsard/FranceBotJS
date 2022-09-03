/**
 * @author Benjamin Guirlet
 * @description
 *      Ajoute deux emojis pour des votes sous les messages d'un salon.
 */

const { Message } = require( "discord.js" );


class Vote {
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor(client, active) {
		this.client = client;
		this.db = this.client.db;
		this._active = active;
	}

	set active(active) { this._active = active; }
	get active() { return this._active; }

	/**
	 * Ajoute deux emojis sous un message.
	 * @param {Message} msg Le message qui va recevoir les emojis.
	 */
	async ajouterEmojiVote( msg ) {
		if ( this._active ) return;

		await msg.react( "👍" );
		await msg.react( "👎" );
	}
}


module.exports = {
	Vote
}