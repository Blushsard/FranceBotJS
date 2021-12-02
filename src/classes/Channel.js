/**
 * @author Benjamin Guirlet
 * @description
 *      This file contains the class 'Channel' used to store the data received from a query (table Channels)
 *      for a channel.
 */


/**
 * Class used to store the data from a row from the database.
 * It eases the use of the data and may lock access to certain properties.
 */
class Channel {
	_channel_id;
	_memes;
	_reposts;
	_feed;
	_logs;
	_stats;


	constructor( channel_id, memes, reposts, feed, logs, stats ) {
		this._channel_id = channel_id;
		this._memes = memes;
		this._reposts = reposts;
		this._feed = feed;
		this._logs = logs;
		this._stats = stats;
	}


	get channel_id() { return this._channel_id; }
	get memes() { return this._memes; }
	get reposts() { return this._reposts; }
	get feed() { return this._feed; }
	get logs() { return this._logs; }
	get stats() { return this._stats; }
}


module.exports = {
	Channel
}