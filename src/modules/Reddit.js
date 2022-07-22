/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant l'upload des memes sur Reddit.
 */

const RedditApi = require( "reddit" );


class Reddit
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.client = client;
		this.db = this.client.db;
		this._active = active;

		this.redditApi = new RedditApi({
			username: 'FranceBot',
			password: '7&htOV?&dKF?bW',
			appId: '4yer1fMp0pkLA6jXhbGClg',
			appSecret: 'ZoQxnE627_oP0XAnpbMMhv2YuJmNCg',
			userAgent: 'windows:FranceBot:v4 (by u/FranceBot)'
		});
	}

	set active( active ) { this._active = active; }
	get active() { return this._active; }

	/**
	 * Envoit les memes sur reddit.
	 * @param {number} delay Le délai entre chaque intération de l'envoi des memes sur reddit.
	 */
	async reddit( delay ) {
		setInterval(async () => {
			if ( !this._active ) return;

			// Récupération des messages qui peuvent être envoyés sur reddit.
			const messages = await this.db.query(
				"SELECT * FROM messages WHERE b_stf=1 AND b_str=0",
				[]
			);

			for ( let msg of messages ) {
				const attachments = await this.db.query(
					"SELECT * FROM attachments WHERE pk_msg_id=?",
					[ msg["pk_msg_id"] ]
				);
			}
		}, delay );
	}
}


module.exports = {
	Reddit
}