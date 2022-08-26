/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les stats du bot.
 */

const { getMonthlyIntDate, getMonthName } = require( `${process.cwd()}/utils/dateUtils` );


/**
 * Cette classe gère donc toutes les fonctions reliées aux roles_levels dans la base de données.
 * Elle est une classe définie comme attribut de la classe Database.
 */
class StatsManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}

	/**
	 * Renvoie un objet contenant les données du mois courant si il existe dans la bdd.
	 * @return {Promise<object>} Une Promesse complétée avec les données du mois actuel ou null.
	 */
	async fetchCurrentMonth() {
		const result = await this.db.query(
			"SELECT * FROM stats WHERE pk_month_id=?",
			[ getMonthlyIntDate() ]
		);
		return result.length ? result[0]: null;
	}

	async createNewMonth() {
		await this.db.query(
			"INSERT INTO stats VALUES (?,?,?,?,?,?,?,?,?,?,?)",
			[
				getMonthlyIntDate(),
				getMonthName(),
				0, 0, "", 0, "", 0, 0, 0, ""
			]
		);
	}
}


module.exports = {
	StatsManager
}