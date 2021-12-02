/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains the class 'Attachment' used to store the data received from a query (table Attachments)
 *      for an attachement.
 */


/**
 * Class used to store the data from a row from the database.
 * It eases the use of the data and may lock access to certain properties.
 */
class Attachment {
	_aid;
	_msg_id;
	_type;
	_filename;
	_link;

	constructor( aid, msg_id, type, filename, link ) {
		this._aid = id;
		this._msg_id = msg_id;
		this._type = type;
		this._filename = filename;
		this._link = link;
	}


	get aid() { return this._aid; }
	get msg_id() { return this._msg_id; }
	get type() { return this._type; }
	get filename() { return this._filename; }
	get link() { return this._link; }
}


module.exports = {
	Attachment
}