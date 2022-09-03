const mysql = require("mysql2/promise");

/**
 * @author Benjamin Guirlet
 * @description
 *      Un script utilisé une fois pour transférés des données d'une DB à une DB avant le lancement en prod.
 */


async function getConnection( credentials ) {
	return ( await mysql.createConnection( credentials ));
}


async function query( cnx, req, params ) {
	const [ rows ] = await cnx.execute( req, params );
	await cnx.commit();
	await cnx.end();
	return rows ;
}


function getType( fileType, attachUrl ) {
	if ( fileType === "lien" ) return fileType;

	let splittedUrl = attachUrl.split('.');
	return fileType + "/" + splittedUrl[splittedUrl.length - 1];
}


( async () => {
	// Connection à l'ancienne bdd.
	let cnx = await getConnection({
		host: "localhost",
		user: "fmAdmin",
		password: "cFuwTV61$XlrX#",
		database: "FMDatabase"
	});

	let oldMemes = await query( cnx, "SELECT * FROM ListeMemes WHERE stf=1" );
	let newMemes = [];
	let attachments = [];
	for ( let oldMeme of oldMemes ) {
		newMemes.push([
			String(oldMeme["msg_id"]),
			String(oldMeme["author_id"]),
			String(oldMeme["channel_id"]),
			oldMeme["likes"],
			oldMeme["stf"],
			oldMeme["stt"],
			oldMeme["str"],
			oldMeme["repost"],
			oldMeme["date_mois"],
			oldMeme["jump_url"],
			oldMeme["msg_content"]
		]);
		attachments.push([
			String(oldMeme["msg_id"]),
			getType( oldMeme["file_type"], oldMeme["attach_url"] ),
			oldMeme["attach_url"]
		]);
	}

	for ( let meme of newMemes ) {
		await query( cnx, "INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?,?,?)", meme );
	}

	for ( let attachment of attachments ) {
		await query( cnx, "INSERT INTO attachments VALUES (?,?,?)", attachment );
	}

	console.log( "walaaaaaaaaaaaaaaaaaaa" );
})();