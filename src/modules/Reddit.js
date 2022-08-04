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
			username: process.env.REDDIT_USERNAME,
			password: process.env.REDDIT_PASSWORD,
			appId: process.env.REDDIT_APP_ID,
			appSecret: process.env.REDDIT_APP_SECRET,
			userAgent: process.env.REDDIT_USER_AGENT
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

			const guild = await this.client.guilds.fetch( process.env.GUILD_ID );

			for ( let msg of messages ) {
				const author = await guild.members.fetch( msg["s_author_id"] );
				if ( !author ) continue;

				const attachments = await this.db.query(
					"SELECT * FROM attachments WHERE pk_msg_id=?",
					[ msg["pk_msg_id"] ]
				);

				for ( let attachment of attachments )
					await this.sendMeme( attachment["s_url"], author.nickname ?? author.user.username );
				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_str", true );
			}
		}, delay );
	}

	/**
	 * Envoi le meme sur le subreddit francememes_.
	 * @param {string} memeUrl Le lien discord du meme.
	 * @param {string} authorName Le nom de l'auteur du meme.
	 */
	async sendMeme( memeUrl, authorName ) {
		await this.redditApi.post( "/api/submit", {
			sr: "francememes_",
			kind: "link",
			resubmit: true,
			title: `Par ${authorName}`,
			url: memeUrl
		});
	}
}


module.exports = {
	Reddit
}