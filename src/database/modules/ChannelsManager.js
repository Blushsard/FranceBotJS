/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les salons dans la base de données.
 */


/**
 * Cette classe gère donc toutes les fonctions reliées aux salons dans la base de données.
 * Elle est une classe définie comme attribut de la classe Database.
 */
class ChannelsManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}

	/**
	 * Récupère un salon de la base de données.
	 * @param {string} channelId L'identifiant du salon.
	 * @returns {Promise<object>} Une Promesse complétée avec un objet contenant les données du salon si il est présent dans
	 * 							 la bdd, sinon null.
	 */
	async fetchChannel( channelId ) {
		return await this.db.oneResultQuery(
			"SELECT * FROM channels WHERE pk_id_channel=?;",
			[ channelId ]
		);
	}

	/**
	 * Récupère tout les salons avec la valeur spécifiée dans la colonne spécifiée.
	 * @param {string} column Le nom de la colonne contenant la valeur.
	 * @param {boolean} value La valeur recherchée.
	 * @return {array[object]} Une liste contenant les objets des salons.
	 */
	async fetchChannelsByValue( column, value ) {
		return await this.db.query(
			`SELECT * FROM channels WHERE ${column}=?`,
			[ value ]
		);
	}

	/**
	 * Récupère le premier salon dans la table avec la valeur passée en paramètre.
	 * @param {string} columnName La colonne ciblée.
	 * @param {boolean} value La valeur requise.
	 * @returns {Promise<object>} Une Promesse complétée avec l'objet du salon ou null.
	 */
	async fetchOneChannelByValue(columnName, value ) {
		return await this.db.oneResultQuery( `SELECT * from channels WHERE ${columnName}=?`, [ value ] );
	}

	/**
	 * Ajoute un salon à la base de données.
	 * Par défaut, toutes les valeurs du salon sont fausses.
	 * @param {string} channelId L'identifiant du salon à ajouté.
	 */
	async addChannel( channelId ) {
		await this.db.query(
			"INSERT INTO channels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
			[ channelId, false, false, false, false, false, false, false, false ]
		);
	}

	/**
	 * Met à jour un salon dans la base de données. Si le salon n'est pas dans la bdd, alors il est ajouté puis mis-à-jour.
	 * Si la mise à jour concerne les valeurs 'feed', 'logs' et 'stats', alors le salon ayant précédemment cette valeur
	 * verra sa valeur passée à false dans la colonne correspondante.
	 * @param {string} channelId L'identifiant du salon.
	 * @param {string} columnName Le nom de la colonne à mettre à jour.
	 * @param {boolean} value La nouvelle valeur de la colonne.
	 */
	async updateChannel( channelId, columnName, value ) {
		if ( !(await this.fetchChannel( channelId )) )
			await this.addChannel( channelId );

		if ( [ 'feed', 'logs', 'stats' ].includes( columnName ) && value )
		{
			const prevChannelId = await this.fetchOneChannelByValue( columnName, true );
			await this.db.query( `UPDATE channels SET ${columnName}=0 WHERE pk_id_channel=?`, [ prevChannelId ] );
		}
		await this.db.query( `UPDATE channels SET ${columnName}=? WHERE pk_id_channel=?;`, [ value, channelId ] );
	}
}


module.exports = {
	ChannelsManager
}