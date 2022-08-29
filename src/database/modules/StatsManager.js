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

	/**
	 * Met à jour les données du mois dans la table.
	 * @param {object} monthData Un objet contenant les données du mois.
	 */
	async registerMonthStats( monthData ) {
		await this.db.query(
			`UPDATE stats SET ` +
			`n_memes_sent=${monthData['n_memes_sent']}, ` +
			`n_record_likes=${monthData['n_record_likes']}, ` +
			`s_id_auteur_record_likes=${monthData['s_id_auteur_record_likes']}, ` +
			`n_record_likes_cumules=${monthData['n_record_likes_cumules']}, ` +
			`s_id_auteur_record_likes_cumules=${monthData['s_id_auteur_record_likes_cumules']}, ` +
			`n_total_likes=${monthData['n_total_likes']}, ` +
			`n_memes_feed=${monthData['n_memes_feed']}, ` +
			`n_best_emoji=${monthData['n_best_emoji']} ` +
			`WHERE pk_month_id=${monthData['pk_month_id']}`
		);
	}
}


module.exports = {
	StatsManager
}