/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant la moyenne des likes du bot.
 *      La moyenne est toujours calculée et ne peut être désactivée.
 */

const { getMonthIntDate } = require( `${process.cwd()}/utils/dateUtils` );


class Moyenne
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 */
	constructor( client ) {
		this.client = client;
		this.db = this.client.db;

		this._moyenne = 0;
		this._active = true;
	}

	get active() { return this._active; }
	getMoyenne() { return this._moyenne; }
	getMoyenneRepost() { return this._moyenne / 2;}


	/**
	 * Calcule la moyenne toutes les X millisecondes.
	 * @param {string} delay Le délai entre chaque calcul de la moyenne en ms.
	 */
	async calcMoyenne( delay ) {
		await this.calculerValeurMoyenne();
		setInterval( async () => {
			await this.calculerValeurMoyenne();
		}, Number( delay ) );
	}

	async calculerValeurMoyenne() {
		const data = (await this.db.query(
			"SELECT * FROM moyenne_data;"
		))[0];

		const likes = await this.db.query(
			`SELECT n_likes FROM messages WHERE n_date>? ORDER BY n_likes DESC LIMIT ${data["n_nb_msg_moyenne"]}`,
			[ getMonthIntDate() - 3 ]
		);

		if ( !likes.length ) {
			this._moyenne = 50;
			return;
		}

		let moyenneTemp = 0;
		for ( let like of likes )
			moyenneTemp += like["n_likes"];

		this._moyenne = moyenneTemp / likes.length;
	}
}


module.exports = {
	Moyenne
}