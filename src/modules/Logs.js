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

	/**
	 * Log envoyé quand un message est envoyé dans un salon de memes (likes).
	 */
	async messageMemeEnvoye() {}

	/**
	 * Log envoyé quand un message dans un salon de memes (likes) est supprimé.
	 */
	async memeSupprime() {}

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