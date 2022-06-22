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
	 * Récupère un user depuis la base de données.
	 * @param {string} userId L'identifiant de l'user.
	 * @returns {Promise<object|null>} Un objet contenant les données de l'user ou null.
	 */
	async fetchUser( userId ) {
		const row = await this.db.query(
			"SELECT *, (SELECT COUNT(*) FROM users) AS total_users FROM " +
			"(SELECT *, ROW_NUMBER() OVER (ORDER BY n_xp DESC) AS rang FROM users) AS u WHERE u.pk_user_id=?;",
			[ userId ]
		);
		return row.length ? row[0] : null;
	}
}


module.exports = {
	MessagesManager
}