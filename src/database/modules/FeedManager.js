/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant la table d'association entre le feed et les messages.
 */


/**
 * Cette classe gère donc toutes les fonctions reliées aux users dans la base de données.
 * Elle est une classe définie comme attribut de la classe Database.
 */
class FeedManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}

	/**
	 * Récupère tout les messages pouvant aller dans le feed.
	 * @param {number} moyenne La moyenne indiquant le nombre de likes minimum pour aller dans le feed.
	 * @return {Promise<array[object]>} Une Promesse complétée avec une liste contenant les objets des messages.
	 */
	async fetchFeedQualifyingMessages( moyenne ) {
		return await this.db.query(
			"SELECT * FROM messages WHERE b_stf=0 AND n_likes>=? AND b_removed=0",
			[ moyenne ]
		);
	}

	/**
	 * Lie un message du feed à son message d'origine en l'ajoutant à la table asso_feed_msg.
	 * @param {string} feedMsgId L'id du message dans le feed.
	 * @param {string} originMsgId L'id du message d'origine contenant les memes.
	 */
	async linkFeedToOriginMsg( feedMsgId, originMsgId ) {
		await this.db.query(
			"INSERT INTO asso_feed_msg VALUES (?,?)",
			[ feedMsgId, originMsgId ]
		);
	}

	/**
	 * Récupère tout les liens correspondant à la valeur spécifiée passée dans la colonne spécifiée.
	 * @param {string} column Le nom de la colonne contenant la valeur.
	 * @param {string} value Un identifiant contenu dans une string.
	 * @return {array[object]} Une liste contenant les objets des liens.
	 */
	async fetchLinks( column, value ) {
		return await this.db.query(
			`SELECT * FROM asso_feed_msg WHERE ${column}=?`,
			[ value ]
		);
	}


	/**
	 * Supprime toutes les lignes contenant la valeur spécifiée dans la colonne spéficiée.
	 * @param {string} column Le nom de la colonne contenant la valeur.
	 * @param {string} value Un identifiant contenu dans une string.
	 */
	async deleteRows( column, value ) {
		await this.db.query(
			`DELETE FROM asso_feed_msg WHERE ${column}=?`,
			[ value ]
		);
	}
}


module.exports = {
	FeedManager
}