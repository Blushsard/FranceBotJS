/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant les logs du bot.
 */
const { MessageEmbed, TextChannel } = require("discord.js");


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
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }
}


module.exports = {
	Logs
}