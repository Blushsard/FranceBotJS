/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de niveau.
 *      Liste des actions donnant de l'expérience:
 *      	- message envoyé: 8xp
 *      	- ajouter un like à un meme: 4xp (limite: 10 par jour)
 *      	- obtenir un like sur un meme: 1xp
 *      	- meme dans le feed: 50xp
 *
 *      Liste des actions retirant de l'expérience:
 *      	- meme supprimé pour respost: -10xp
 */
const { Client, Collection } = require( "discord.js" );


class Levels
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.active = active;
		this.client = client;

		// Collection contenant les vérifications des différentes limitations par user.
		this.limits = new Collection();
	}

	getActive() { return this.active; }
	setActive( active ) { this.active = active; }
}


module.exports = {
	Levels
}