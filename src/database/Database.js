/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient toutes les méthodes interagissant avec la base de données.
 * 		Le module 'mysql2' est utilisé pour les requêtes SQL.
 */
const mysql = require( "mysql2/promise" );
const { UsersManager } = require( `${process.cwd()}/database/UsersManager` );
const { ChannelsManager } = require( `${process.cwd()}/database/ChannelsManager` );
const { RolesLevelsManager } = require( `${process.cwd()}/database/RolesLevelsManager` );


/**
 * Cette classe fournit l'accès à la base de données au client.
 * Elle contient d'autres classes contenant chacune des fonctions propres
 * à une partie de la base de données (ex: users).
 */
class Database
{
	constructor() {
		// Limitation du nombre de connexions simultanées.
		this.limit = 80;
		this.currentRequests = 0;


		this.usersManager = new UsersManager( this );
		this.channelsManager = new ChannelsManager( this );
		this.rolesLevelsManager = new RolesLevelsManager( this );
	}


	sleep( ms ) {
		return new Promise(resolve => setTimeout( resolve, ms ) );
	}


	/**
	 * Retourne une connexion avec la base de données.
	 * @return {Promise<mysql.Connection>} Une Promesse complétée avec la connexion à la base de données.
	 */
	async _getConnection() {
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
	 * @param {string} req - La requête SQL à exécuter.
	 * @param {array} [params] - Une liste contenant les paramètres de la requête (optionnel).
	 * @returns {Promise<array>} Une Promesse complété avec une liste contenant les résultats de la requête.
	 */
	async query( req, params ) {
		while ( this.limit === this.currentRequests ) {
			await this.sleep( 100 );
		}

		this.currentRequests++;
		const cnx = await this._getConnection();

		const [ rows ] = await cnx.execute( req, params);
		await cnx.commit();
		await cnx.end();

		this.currentRequests--;
		return rows ;
	}
}




/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	Database
}