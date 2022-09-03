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
const { StatsManager } = require( `${process.cwd()}/database/modules/StatsManager` );
const { FeedManager } = require( `${process.cwd()}/database/modules/FeedManager` );


/**
 * Cette classe fournit l'accès à la base de données au client.
 * Elle contient d'autres classes contenant chacune des fonctions propres
 * à une partie de la base de données (ex: users).
 */
class Database
{
	constructor( client ) {
		// Limitation du nombre de connexions simultanées.
		this.limit = process.env.MAX_CONCURRENT_DATABASE_REQUESTS;
		this.currentRequests = 0;
		this.client = client;


		this.usersManager = new UsersManager( this );
		this.channelsManager = new ChannelsManager( this );
		this.rolesLevelsManager = new RolesLevelsManager( this );
		this.messagesManager = new MessagesManager( this );
		this.statsManager = new StatsManager( this );
		this.feedManager = new FeedManager( this );
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

		const [ rows ] = await cnx.execute( req, params );
		await cnx.commit();
		await cnx.end();

		this.currentRequests--;
		return rows ;
	}


	/**
	 * Cette fonction est un wrapper pour la fonction query mais elle permet de directement retourner le premier résultat
	 * de la requête ou null.
	 * @param {string} req - La requête SQL à exécuter.
	 * @param {array} [params] - Une liste contenant les paramètres de la requête (optionnel).
	 * @returns {Promise<object>} Une Promesse complété avec un objet contenant le résultat de la requête ou null.
	 */
	async oneResultQuery( req, params ) {
		const result = await this.query( req, params );
		return result.length ? result[0] : null;
	}
}




/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	Database
}