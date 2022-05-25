/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient toutes les méthodes interagissant avec la base de données.
 * 		Le module 'mysql2' est utilisé pour les requêtes SQL.
 */
const mysql = require( "mysql2/promise" );


class Database
{
	/**
	 * Retourne une connexion avec la base de données.
	 * @return {Promise<mysql.Connection>} Une Promesse complétée avec la connexion à la base de données.
	 */
	async getConnection() {
		return ( await mysql.createConnection({
				host: process.env.HOST,
				user: process.env.USER,
				password: process.env.PASSWORD,
				database: process.env.DATABASE
			}
		));
	}


	/**
	 * Exécute la requête passée en paramètres et retourne le résultat de cette requête.
	 * @param {string} query - La requête SQL à exécuter.
	 * @param {array} [params] - Une liste contenant les paramètres de la requête (optionnel).
	 * @returns {Promise<array>} Une Promesse complété avec une liste contenant les résultats de la requête.
	 */
	async query( query, params = [] ) {
		const cnx = await this.getConnection();

		const [ rows ] = await cnx.execute( query, params);
		await cnx.commit();
		await cnx.end();

		return rows ;
	}
}




/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	Database
}