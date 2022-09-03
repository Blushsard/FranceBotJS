/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les users dans la base de données.
 */


/**
 * Cette classe gère donc toutes les fonctions reliées aux users dans la base de données.
 * Elle est une classe définie comme attribut de la classe Database.
 */
class UsersManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}


	/**
	 * Récupère un user depuis la base de données.
	 * @param {string} userId L'identifiant de l'user.
	 * @returns {Promise<object|null>} Un objet contenant les données de l'user ou null.
	 */
	async fetchUser( userId ) {
		return await this.db.oneResultQuery(
			"SELECT *, (SELECT COUNT(*) FROM users) AS total_users FROM " +
			"(SELECT *, ROW_NUMBER() OVER (ORDER BY n_xp DESC) AS rang FROM users) AS u WHERE u.pk_user_id=?;",
			[ userId ]
		);
	}

	/**
	 * Récupère la liste des 10 premiers en XP dans la base, changer la limite si on veut plus.
	 * @returns {Promise<Array|null>}
	 */
	async fetchLeaderboard() {
		const rows = await this.db.query(
			"SELECT *," +
			"ROW_NUMBER() OVER (ORDER BY n_xp desc) AS rang, " +
			"(SELECT count(*) FROM users) AS total_users " +
			"FROM users " +
			"LIMIT 10;"
		)
		return rows.length ? rows : null;
	}


	/**
	 * Ajoute un user dans la base de données.
	 * @param {string} userId L'identifiant discord de l'user.
	 * @param {int} level Le niveau de l'utilisateur.
	 * @param {int} xp L'expérience totale de l'utilisateur.
	 * @param {int} nb_msg Le nombre de messages total envoyés par l'utilisateur.
	 * @param {number} progress Le progrès sur le niveau actuel en pourcentage.
	 * @return {object} Un objet contenant les données de l'utilisateur.
	 */
	async addUser( userId, level=0, xp=0, nb_msg=0, progress=0 ) {
		await this.db.query(
			"INSERT INTO users VALUES (?,?,?,?,?);",
			[ userId, level, xp, nb_msg, progress ]
		);
		return {
			"pk_user_id": userId,
			"n_level": level,
			"n_xp": xp,
			"n_nb_messages": nb_msg,
			"n_progress": progress
		};
	}

	/**
	 * Supprime un utilisateur de la base de données.
	 * @param {string} userId L'identifiant de l'utilisateur.
	 */
	async removeUser( userId ) {
		await this.db.query(
			"DELETE FROM users WHERE pk_user_id=?",
			[ userId ]
		);
	}


	/**
	 * Met à jour une colonne de l'user.
	 * @param {string} userId L'identifiant de l'user.
	 * @param {string} columnName Le nom de la colonne.
	 * @param value La nouvelle valeur de cette colonne.
	 */
	async updateUser( userId, columnName, value ) {
		await this.db.query(
			`UPDATE users SET ${columnName}=? WHERE pk_user_id=?;`,
			[ value, userId ]
		);
	}


	/**
	 * Ajoute de l'expérience à l'user dans la base de données.
	 * @param {string} userId L'identifiant de l'user.
	 * @param {int} exp L'expérience à ajouter.
	 * @return {Promise<object>} L'objet contenant les données de l'user après l'ajout.
	 */
	async ajouterExperienceUser( userId, exp ) {
		let user = await this.fetchUser( userId );
		if ( !user ) {
			user = await this.addUser( userId );
			exp = exp > 0 ? exp : 0;
		}
		else {
			if ( user["n_xp"] + exp <= 0 )
				exp = 0;
		}

		await this.db.query(
			"UPDATE users SET n_xp=? WHERE pk_user_id=?;",
			[ exp, userId ]
		);

		user["n_xp"] += exp;
		return user;
	}

	/**
	 * Incrémente de 1 le compteur de messages de l'utilisateur.
	 * @param {string} userId L'id de l'utilisateur ciblé.
	 */
	async incrementeCompteurMessagesUser( userId ) {
		await this.db.query(
			"UPDATE users SET n_nb_messages=n_nb_messages+1 WHERE pk_user_id=?",
			[ userId ]
		);
	}
}


module.exports = {
	UsersManager
}