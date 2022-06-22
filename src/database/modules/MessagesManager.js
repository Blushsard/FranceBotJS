/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les messages et leurs memes dans la base de données.
 */

const { Message } = require( "discord.js" );
const { getMonthlyIntDate } = require( `${process.cwd()}/utils/dateUtils` );


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
		await this.db.query(
			"INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?)",
			[
				message.id,
				message.author.id,
				message.channel.id,
				likes,
				false,
				false,
				false,
				false,
				getMonthlyIntDate()
			]
		);

		let queryParams;
		for ( let element of memes ) {
			if ( typeof element === "string" )
				queryParams = [ message.id, "lien", "lien", element ];
			else
				queryParams = [ message.id, element.contentType.split( "/" )[0], element.name, element.url ];

			await this.db.query(
				"INSERT INTO attachments VALUES (?,?,?,?);",
				queryParams
			)
		}
	}

	/**
	 * Supprime un message et ses memes de la base de données.
	 * @param {string} messageId L'identifiant du message.
	 */
	async supprimerMessage( messageId ) {
		await this.db.query(
			"DELETE FROM messages WHERE pk_msg_id=?",
			[ messageId ]
		);

		await this.db.query(
			"DELETE FROM attachments WHERE pk_msg_id=?",
			[ messageId ]
		);
	}
}


module.exports = {
	MessagesManager
}