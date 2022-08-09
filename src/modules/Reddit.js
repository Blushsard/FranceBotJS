/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant l'upload des memes sur Reddit.
 */

const { exec } = require( "child_process" );


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

				for ( let attachment of attachments ) {
					// TODO ajouter la gestion des vidéos et liens tel youtube.
					// Voir si on peut upload des vidéos de discord comme des vidéos de youtube.
					exec(`python ${process.cwd()}/python_scripts/memes_to_reddit.py "By ${author.displayName}" ${attachment['s_url']} ${attachment['s_type']}`,
					(error, stdout, stderr) => {
						if (error) {
							console.log(error);
							return;
						}
						console.log(stdout)
						console.log(stderr)
					});
				}

				await this.db.messagesManager.updateMessage( msg["pk_msg_id"], "b_str", true );
			}
		}, delay );
	}
}


module.exports = {
	Reddit
}