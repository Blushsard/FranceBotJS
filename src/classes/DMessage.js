/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains the class 'DMessage' used to store the data received from a query (table DMessage)
 *      for a message.
 */


/**
 * Class used to store the data from a row from the database.
 * It eases the use of the data and may lock access to certain properties.
 * This class has a D prefixe to avoid name collisions with the class 'Message' from discord.js.
 */
class DMessage {
	_msg_id;
	_author_id;
	_channel_id;
	_cat_name;
	_likes;
	_reposts;
	_msg_content;
	_day_date;
	_month_date;
	_stf;
	_stt;
	_str;


	constructor( msg_id, author_id, channel_id, cat_name, likes, reposts, msg_content,
				 day_date, month_date, stf, stt, str ) {
		this._msg_id = msg_id;
		this._author_id = author_id;
		this._channel_id = channel_id;
		this._cat_name = cat_name;
		this._likes = likes;
		this._reposts = reposts;
		this._msg_content = msg_content;
		this._day_date = day_date;
		this._month_date = month_date;
		this._stf = stf;
		this._stt = stt;
		this._str = str;
	}


	get msg_id() { return this._msg_id; }
	get author_id() { return this._author_id; }
	get channel_id() { return this._channel_id; }
	get cat_name() { return this._cat_name; }
	get likes() { return this._likes; }
	get reposts() { return this._reposts; }
	get msg_content() { return this._msg_content; }
	get day_date() { return this._day_date; }
	get month_date() { return this._month_date; }
	get stf() { return this._stf; }
	get stt() { return this._stt; }
	get str() { return this._str; }
}


module.exports = {
	Message: DMessage
}