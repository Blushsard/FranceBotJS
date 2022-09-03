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


( async () => {
	// Connection à l'ancienne bdd.
	let cnx = await getConnection({
		host: "localhost",
		user: "fmAdmin",
		password: "cFuwTV61$XlrX#",
		database: "FMDatabase"
	});

	let memes = await query( cnx, "SELECT * FROM ListeMemes WHERE stf=1" );
	console.log( memes.length )
	console.log( memes )
})();