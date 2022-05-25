/**
 * @author Benjamin Guirlet
 * @description
 *      La classe gérant les roles des niveaux (roles_levels) dans la base de données.
 */


/**
 * Cette classe gère donc toutes les fonctions reliées aux roles_levels dans la base de données.
 * Elle est une classe définie comme attribut de la classe Database.
 */
class RolesLevelsManager
{
	/**
	 * @param {Database} db La classe donnant accès à la base de données dans le client.
	 */
	constructor( db ) {
		this.db = db;
	}


	/**
	 * Récupère un role_levels par le niveau de la base de données.
	 * @param {int} niveau Le niveau recherché.
	 * @param {string} guildId L'identifiant discord de la guild concernée.
	 * @returns {Promise<array>} Une Promesse complétée avec un objet contenant les données du salon si il est présent dans
	 * 							 la bdd, sinon null.
	 */
	async fetchRoleByLevel( niveau, guildId ) {
		const row = await this.db.query(
			"SELECT * FROM roles_levels WHERE n_niveau_requis=? AND s_guild_id=?;",
			[ niveau, guildId ]
		);

		return row.length ? row[0] : null;
	}


	/**
	 * Ajouter un rôle dans la base de données.
	 * @param {string} roleId L'identifiant discord du rôle.
	 * @param {string} guildId L'identifiant discord de la guild concernée.
	 * @param {int} niveau Le niveau requis pour avoir le rôle.
	 */
	async ajouterRoleLevel( roleId, guildId, niveau ) {
		await this.db.query(
			"INSERT INTO roles_levels VALUES (?,?,?);",
			[ roleId, guildId, niveau ]
		);
	}


	/**
	 * Met à jour un role_levels de la base de données.
	 * @param {string} roleId L'identifiant discord du nouveau rôle.
	 * @param {int} niveau Le niveau du rôle à mettre à jour.
	 * @param {string} guildId L'identifiant discord de la guild concernée.
	 */
	async updateRoleByLevel( roleId, niveau, guildId ) {
		await this.db.query(
			`UPDATE roles_levels SET pk_role_id=? WHERE n_niveau_requis=? AND s_guild_id=?;`,
			[ roleId, niveau, guildId ]
		);
	}


	/**
	 * Supprime un role_levels de la base de données.
	 * @param {int} niveau Le niveau du rôle à supprimer.
	 * @param {string} guildId L'identifiant discord de la guild concernée.
	 */
	async removeRoleByLevel( niveau, guildId ) {
		await this.db.query(
			"DELETE FROM roles_levels WHERE n_niveau_requis=? AND s_guild_id=?",
			[ niveau, guildId ]
		);
	}
}


module.exports = {
	RolesLevelsManager
}