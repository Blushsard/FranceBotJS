/**
 * @author Benjamin Guirlet
 * @file
 * 		Ce fichier contient toutes les méthodes interagissant avec la base de données.
 * 		Le module 'mysql2' est utilisé pour les requêtes SQL.
 */


const mysql = require( "mysql2/promise" );
const dateUtils = require( "./dateUtils" );
const { HOST, USER, PASSWORD, DATABASE } = require( "../files/config.json" )
const { Message, MessageAttachment } = require( "discord.js" );


/**
 * Retourne une connexion avec la base de données.
 * @return {Promise<mysql.Connection>} Une Promesse complétée avec la connexion à la base de données.
 */
async function getConnection() {
	return ( await mysql.createConnection({
			host: HOST,
			user: USER,
			password: PASSWORD,
			database: DATABASE
		}
	));
}


/**
 * Exécute la requête passée en paramètres et retourne le résultat de cette requête.
 * @param {string} query - La requête SQL à exécuter.
 * @param {array} [params] - Une liste contenant les paramètres de la requête (optionnel).
 * @returns {Promise<array>} Une Promesse complété avec une liste contenant les résultats de la requête.
 */
async function query( query, params = [] ) {
	const cnx = await getConnection();

	const [ rows ] = await cnx.execute( query, params);
	await cnx.commit();
	await cnx.end();

	return rows ;
}


/* ----------------------------------------------- */
/* FUNCTIONS CHANNELS                              */
/* ----------------------------------------------- */
/**
 * Récupère un salon de la base de données.
 * @param channelID L'identifiant du salon.
 * @returns {Promise<array>} Une Promesse complétée avec un objet contenant les données du salon si il est présent dans
 * 							 la bdd, sinon null.
 */
async function fetchChannel( channelID ) {
	const channel = await query(
		"SELECT * FROM Salons WHERE id_salon=?;",
		[channelID]
	);

	return channel.length ? channel[0] : null;
}


/**
 * Ajoute un salon à la base de données.
 * Par défaut, toutes les valeurs du salon sont fausses.
 * @param {string} channelID L'identifiant du salon à ajouté.
 */
async function addChannel( channelID ) {
	await query(
		"INSERT INTO Salons VALUES (?, ?, ?, ?, ?, ?, ?);",
		[channelID, false, false, false, false, false, false]
	);
}


/**
 * Met-à-jour un salon dans la base de données. Si le salon n'est pas dans la bdd, alors il est ajouté puis mis-à-jour.
 * Si la mise à jour concerne les valeurs 'feed', 'logs' et 'stats', alors le salon ayant précédemment cette valeur
 * verra sa valeur passée à false dans la colonne correspondante.
 * @param channelID L'identifiant du salon.
 * @param {string} columnName Le nom de la colonne à mettre à jour.
 * @param {boolean} value La nouvelle valeur de la colonne.
 */
async function updateChannel( channelID, columnName, value ) {
	if ( !(await fetchChannel( channelID )) )
		await addChannel( channelID );

	if ( [ 'feed', 'logs', 'stats' ].includes( columnName ) && value )
	{
		const prevChannelId = await fetchChannelByValue( columnName, true );
		await query( `UPDATE Salons SET ${columnName}=0 WHERE id_salon=?`, [ prevChannelId ] );
	}
	await query( `UPDATE Salons SET ${columnName}=? WHERE id_salon=?;`, [value, channelID] );
}


/**
 * Récupère tout les salons avec une valeur ciblée dans une colonne.
 * @param {string} columnName La colonne ciblée.
 * @param {boolean} value La valeur requise.
 * @returns {Promise<array[object]>} Une Promesse complétée avec la liste de tous les salons trouvés.
 */
async function fetchChannelByValue( columnName, value ) {
	return await query( `SELECT * from Salons WHERE ${columnName}=?`, [ value ] );
}


/* ----------------------------------------------- */
/* FUNCTIONS MESSAGES                              */
/* ----------------------------------------------- */
/**
 * Ajoute le message ainsi que ses memes dans la base de données.
 * @param {Message} message L'objet du message concerné.
 * @param {int} likes Le nombre de likes du message.
 * @param {array[string|MessageAttachment]} attachmentsArray La liste contenant les memes du message.
 */
async function sendMemeToDatabase( message, likes, attachmentsArray ) {
	await query(
		"INSERT INTO Messages VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",
		[
			message.id,
			message.author.id,
			message.channelId,
			message.channel.parent.name,
			message.url,
			likes,
			message.content,
			dateUtils.getDayFormatDate(),
			dateUtils.getMonthFormatDate(),
			false,
			false,
			false
		]
	);

	let queryParams;
	for ( let element of attachmentsArray ) {
		if ( typeof element === "string" ) {
			queryParams = [
				message.id,
				"lien",
				"lien",
				element
			]
		}
		else {
			queryParams = [
				message.id,
				element.contentType.split( "/" )[0],
				element.name,
				element.url
			]
		}

		await query(
			"INSERT INTO Attachments VALUES (?,?,?,?);",
			queryParams
		)
	}
}


/**
 * Retourne une liste avec les données du message si il est présent dans la base de données sinon null.
 * @param messageId L'identifiant du message.
 * @returns {Promise<object>} Une Promesse complétée avec un objet contenant les données du message.
 */
async function fetchMessage( messageId ) {
	const row = await query(
		"SELECT * FROM Messages WHERE msg_id=?;",
		[ messageId ]
	);

	return row.length ? row[0] : null;
}


/**
 * Récupère plusieurs messages de la base de données avec une condition.
 * La condition doit être sous la forme d'une condition SQL.
 * @param {string} filter La condition servant de filtre.
 * @returns {Promise<array[object]>} Une Promesse complétée avec la liste des objets contenant les données des memes.
 */
async function fetchMessages( filter ) {
	return await query( `SELECT * FROM Messages WHERE ${filter}` );
}


/**
 * Met à jour un message.
 * @param messageId L'identifiant du message.
 * @param {string} udpType Le nom de la colonne à mettre à jour.
 * @param udpValue La nouvelle valeur de la colonne.
 */
async function updateMessage( messageId, udpType, udpValue ) {
	await query(
		`UPDATE Messages SET ${udpType}=? WHERE msg_id=?;`,
		[ udpValue, messageId ]
	);
}


/**
 * Supprime un message et ses memes de la base de données.
 * @param messageId L'identifiant du message.
 */
async function removeMessage( messageId ) {
	await query(
		"DELETE FROM Messages WHERE msg_id=?",
		[ messageId ]
	);

	await query(
		"DELETE FROM Attachments WHERE msg_id=?",
		[ messageId ]
	);
}


/* ----------------------------------------------- */
/* FUNCTIONS ATTACHMENTS                           */
/* ----------------------------------------------- */
/**
 * Récupère les memes d'un message.
 * @param {String} messageId L'identifiant du message.
 * @returns {Promise<array[object]>} Une Promesse complétée avec une liste des objets contenant les données des messages.
 */
async function fetchAttachments( messageId ) {
	return await query(
		"SELECT * FROM Attachments WHERE msg_id=?",
		[ messageId ]
	);
}


/* ----------------------------------------------- */
/* FUNCTIONS LIKESAVERAGE                          */
/* ----------------------------------------------- */
async function getLikesAverage() {
	const row = await query( "SELECT moyenne from Moyenne;" );
	return row.length ? row[0]['average'] : null;
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	query,
	updateChannel,
	fetchChannel,
	fetchChannelByValue,

	sendMemeToDatabase,
	fetchMessage,
	fetchMessages,
	updateMessage,
	removeMessage,

	fetchAttachments,

	getLikesAverage
}