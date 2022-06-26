/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant la moyenne des likes du bot.
 */


class Moyenne
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

		this._moyenne = 0;
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }

	get moyenne() { return this._moyenne; }

	/**
	 * Calcule la moyenne toutes les X millisecondes.
	 * @param {number} delay Le délai entre chaque calcul de la moyenne en ms.
	 */
	async calcMoyenne( delay ) {
		setInterval( async () => {
			const queryResult = (await this.db.query(
				"SELECT * FROM moyenne_data;"
			))[0];

			// Récupération de la somme des likes et du nombre de memes dans la moyenne.
			const nbLikesMsg = (await this.db.query(
				`SELECT sum(n_likes) AS sommeLikes, count(pk_msg_id) as nbMsg 
			FROM messages ORDER BY n_likes LIMIT ${queryResult["n_nb_msg_moyenne"]}`
			))[0];

			// Dans le cas ou le nombre de messages est à 0, on met la moyenne à 1 car elle est inutile tant qu'il n'y a pas
			// de messages. De plus, il y aura toujours des messages.
			this._moyenne = nbLikesMsg["sommeLikes"] != null
				? (nbLikesMsg["sommeLikes"] / nbLikesMsg["nbMsg"])
				: 1;
		}, delay);
	}
}


module.exports = {
	Moyenne
}