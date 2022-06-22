/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient toutes les méthodes interagissant avec la base de données.
 * 		Le module 'mysql2' est utilisé pour les requêtes SQL.
 */
const mysql = require( "mysql2/promise" );
const { UsersManager } = require( `${process.cwd()}/database/modules/UsersManager` );
const { ChannelsManager } = require( `${process.cwd()}/database/modules/ChannelsManager` );
const { RolesLevelsManager } = require( `${process.cwd()}/database/modules/RolesLevelsManager` );
const { MessagesManager } = require( `${process.cwd()}/database/modules/MessagesManager` );


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
		this.messagesManager = new MessagesManager( this );
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
				host: process.env.HOST_DATABASE,
				user: process.env.USER_DATABASE,
				password: process.env.PASSWORD_DATABASE,
				database: process.env.DATABASE_DATABASE
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
			await this.sleep( 20 );
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