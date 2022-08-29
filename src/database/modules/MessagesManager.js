/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les messages et leurs memes dans la base de données.
 */

const { Message } = require( "discord.js" );
const { getMonthIntDate } = require( `${process.cwd()}/utils/dateUtils` );


class MessagesManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}

	/**
	 * Ajoute un message et ses memes dans la base de données.
	 * @param {Message} message L'objet du message à ajouter dans la base de données.
	 * @param {array} memes Les memes du message.
	 * @param {int} likes Le nombre de likes du message.
	 */
	async ajouterMessage( message, memes, likes ) {
		try {
			await this.db.query(
				"INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?,?,?)",
				[
					message.id,
					message.author.id,
					message.channel.id,
					likes,
					false,
					false,
					false,
					false,
					getMonthIntDate(),
					message.url,
					message.content
				]
			);

			for (let element of memes) {
				await this.db.query(
					"INSERT INTO attachments VALUES (?,?,?);",
					[
						message.id,
						typeof element === "string" ? "lien" : element.contentType,
						typeof element === "string" ? element : element.url
					]
				)
			}
		}
		catch( err ) { this.db.client.emit( "error", err ); }
	}

	/**
	 * Récupère tout les attachments d'un message.
	 * @param {string} messageId L'identifiant du message.
	 * @returns {Promise<array>} Une Promise complétée avec une liste contenant les attachments.
	 */
	async getMessageAttachments( messageId ) {
		return await this.db.query(
			"SELECT * FROM attachments WHERE pk_msg_id=?",
			[ messageId ]
		);
	}

	/**
	 * Modifie le nombre de likes sur un message.
	 * @param {string} messageId L'identifiant du message.
	 * @param {int} likes Le nombre de likes du message.
	 * @returns {Promise<boolean>} Une Promise complétée avec un booléen indiquant si une ligne a été modifiée dans la table.
	 */
	async updateLikesCount( messageId, likes ) {
		const result = await this.db.query(
			"UPDATE messages SET n_likes=? WHERE pk_msg_id=?",
			[ likes, messageId ]
		);
		return !!result["affectedRows"];
	}

	/**
	 * Met à jour un message avec la valeur spécifiée pour le colonne.
	 * @param {string} messageId L'identifiant du message à mettre à jour.
	 * @param {string} columnName Le nom de la colonne à mettre à jour.
	 * @param {string} value La nouvelle valeur de la colonne.
	 * @return {Promise<object>} Une Promise complétée avec un objet contenant les données du message après update.
	 */
	async updateMessage( messageId, columnName, value ) {
		await this.db.query(
			`UPDATE messages SET ${columnName}=? WHERE pk_msg_id=?`,
			[ value, messageId ]
		);

		return await this.db.onResultQuery(
			`SELECT * FROM messages WHERE pk_msg_id=?`,
			[ messageId ]
		);
	}
}


module.exports = {
	MessagesManager
}