/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les stats du bot.
 */

const { getMonthIntDate, getMonthName } = require( `${process.cwd()}/utils/dateUtils` );


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
	 * Renvoie un objet contenant les données du mois demandé.
	 * @param {number} monthId L'identifiant du mois généré avec la fonction getMonthIntDate
	 * @return {Promise<object>} Une promesse complétée avec les données du mois demandé ou null.
	 */
	async fetchMonth( monthId ) {
		return await this.db.oneResultQuery(
			"SELECT * FROM stats WHERE pk_month_id=?",
			[ monthId ]
		);
	}

	async createNewMonth() {
		await this.db.query(
			"INSERT INTO stats VALUES (?,?,?,?,?,?,?,?,?,?,?)",
			[
				getMonthIntDate(),
				getMonthName(),
				0, 0, "", 0, "", 0, 0, 0, ""
			]
		);
	}
}


module.exports = {
	StatsManager
}