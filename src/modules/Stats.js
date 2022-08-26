/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant les statistiques mensuelles de France Memes.
 */


class Stats {
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

	/**
	 * Vérifie si il y a eu un changement de mois, et dans ce cas, créée une nouvelle ligne pour les stats et envoie
	 * les stats du mois précédent dans le salon des stats.
	 * @param {number} delay Le délai entre chaque itération de la boucle en milliseconde.
	 */
	async checkMonth( delay ) {
		let monthCreated = await this.checkIfMonthExists();

		setInterval( async () => {
			monthCreated = await this.checkIfMonthExists();

			// Si un nouveau mois a été créé, alors on envoi les stats du mois précédent.
			if ( monthCreated ) {
				// TODO faire l'envoi des stats et voir si il faut retravailler le système pour check le changement de mois.
			}
		}, delay );
	}


	/**
	 * Vérifie si le mois actuel a bien un ligne dans la table stats.
	 * @return {Promise<boolean>} Une Promesse complétée avec un booléen indiquant si un nouveau mois a été créé.
	 */
	async checkIfMonthExists() {
		const statsManager = this.db.statsManager;
		const currentMonth = await statsManager.fetchCurrentMonth();
		if ( currentMonth ) return false;

		await statsManager.createNewMonth();
		return true;
	}
}


module.exports = {
	Stats
}