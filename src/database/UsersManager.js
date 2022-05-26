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
		const row = await this.db.query(
			"SELECT *, " +
			"(SELECT count(*) FROM users AS u WHERE u.pk_user_id <= users.pk_user_id ORDER BY u.n_xp DESC) AS rang," +
			"(SELECT count(*) FROM users) AS total_users" +
			" FROM users where users.pk_user_id=?;",
			[ userId ]
		);
		return row.length ? row[0] : null;
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
	 */
	async addUser( userId ) {
		await this.db.query(
			"INSERT INTO users VALUES (?,?,?,?,?);",
			[ userId, 0, 0, 0, 0 ]
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
		if ( !(await this.fetchUser( userId ) ) )
			await this.addUser( userId );

		await this.db.query(
			"UPDATE users SET n_xp=n_xp+? WHERE pk_user_id=?;",
			[ exp, userId ]
		);

		return await this.fetchUser( userId );
	}
}


module.exports = {
	UsersManager
}