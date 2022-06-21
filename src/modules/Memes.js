/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de likes et repost du bot.
 *      Il interagit avec les évènement suivants:
 *      	- messageCreate
 *      	- messageDelete
 *      	- messageUpdate
 *      	- messageReactionAdd
 *      	- messageReactionRemove
 */


class Memes
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.client = client;
		this._active = active;
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }


}