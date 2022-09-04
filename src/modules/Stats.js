/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant les statistiques mensuelles de France Memes.
 *      Il gère aussi toutes les statistiques des emojis (classement des emojis).
 */
const { getMonthIntDate } = require("../utils/dateUtils");
const { MessageEmbed, Guild } = require( "discord.js" );


class Stats {
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

	get active() { return this._active; }
	set active( active ) { this._active = active; }

	/**
	 * Vérifie si il y a eu un changement de mois, et dans ce cas, créée une nouvelle ligne pour les stats et envoie
	 * les stats du mois précédent dans le salon des stats.
	 */
	async checkMonth() {
		setInterval( async () => {
			let monthCreated = await this.checkIfMonthExists();

			// Si un nouveau mois a été créé, alors on envoi les stats du mois précédent.
			if ( monthCreated && this._active ) {
				await this.sendStats( monthCreated["pk_month_id"] - 1 );
				await this.transferStatsEmojisToHisto( monthCreated["pk_month_id"] - 1 );
			}
		}, Number( process.env.DELAY_STATS ) );
	}

	/**
	 * Génère et envoi les données du mois dans le salon des stats.
	 * @param {number} monthId L'identifiant du mois pour les stats.
	 */
	async sendStats( monthId ) {
		// Fetch du salon des stats.
		const statsChannelId = await this.db.channelsManager.fetchOneChannelByValue( "b_stats", true );
		if ( !statsChannelId ) return;

		const guild = await this.client.guilds.fetch( process.env.GUILD_ID );
		const statsChannel = await guild.channels.fetch( statsChannelId["pk_id_channel"] );

		const monthBaseData = await this.db.statsManager.fetchMonth( monthId );
		if ( !monthBaseData ) return;

		const monthData = await this.getMonthData( monthId, monthBaseData );
		const monthEmbed = await this.createEmbed( monthData, guild );

		try {
			await statsChannel.send( { embeds: [ monthEmbed ] } );
		}
		catch( err ) {
			console.log( err );
		}

		// Enregistrement des données du mois dans la bdd.
		await this.db.statsManager.registerMonthStats( monthData );
	}


	/**
	 * Renvoie l'objet monthBaseData avec les données complète du mois.
	 * @param {number} monthId L'identifiant du mois demandé.
	 * @param {object} monthBaseData Les données de bases du mois à compléter.
	 * @return {Promise<object>} L'objet contenant les données complètes du mois.
	 */
	async getMonthData( monthId, monthBaseData ) {
		let monthData = monthBaseData;

		monthData['n_memes_sent'] = (await this.db.oneResultQuery(
			"SELECT count(pk_msg_id) as count_memes FROM messages WHERE n_date=?",
			[ monthData['pk_month_id'] ]
		))["count_memes"];

		const recordLikes = await this.db.oneResultQuery(
			"SELECT n_likes, s_author_id FROM messages WHERE n_date=? ORDER BY n_likes DESC LIMIT 1",
			[ monthData['pk_month_id'] ]
		);
		monthData['n_record_likes'] = recordLikes['n_likes'];
		monthData['s_id_auteur_record_likes'] = recordLikes['s_author_id'];

		const recordLikesCumules = await this.db.oneResultQuery(
			"SELECT s_author_id, sum(n_likes) as sum_likes FROM messages WHERE n_date=? " +
			"GROUP BY s_author_id ORDER BY sum_likes DESC LIMIT 1;",
			[ monthData['pk_month_id'] ]
		);
		monthData['n_record_likes_cumules'] = recordLikesCumules['sum_likes'];
		monthData['s_id_auteur_record_likes_cumules'] = recordLikesCumules['s_author_id'];

		monthData['n_total_likes'] = (await this.db.oneResultQuery(
			"SELECT sum(n_likes) as total_likes FROM messages WHERE n_date=?",
			[ monthData['pk_month_id'] ]
		))["total_likes"];

		monthData['n_memes_feed'] = (await this.db.oneResultQuery(
			"SELECT count(pk_msg_id) as count_feed_memes FROM messages WHERE n_date=? AND b_stf=1",
			[ monthData['pk_month_id'] ]
		))["count_feed_memes"];

		const bestEmojiData = await this.db.oneResultQuery(
			"SELECT pk_emoji, n_count FROM stats_emojis ORDER BY n_count DESC LIMIT 1"
		);
		monthData['n_best_emoji'] = bestEmojiData["pk_emoji"];
		monthData['n_count_best_emoji'] = bestEmojiData["n_count"]

		return monthData;
	}

	/**
	 * Créer et renvoie l'embed qui sera envoyé dans le salon des stats.
	 * @param {object} monthData Un objet contenant les données du mois.
	 * @param {Guild} guild La guild de laquelle provienne les stats.
	 * @return {MessageEmbed} L'embed à envoyé dans le salon des stats.
	 */
	async createEmbed( monthData, guild ) {
		const auteurRecordLikesMemes = await guild.members.fetch( monthData['s_id_auteur_record_likes'] );
		const auteurRecordLikesCumules = await guild.members.fetch( monthData['s_id_auteur_record_likes_cumules'] );

		const embed = new MessageEmbed()
			.setTitle( `Statisques du mois de ${monthData['s_month']}` )
			.setColor( "RED" )
			.addFields([
				{ name: "Nombre de memes envoyés :", value: `${monthData['n_memes_sent']}` },
				{ name: "Record de likes sur un meme :", value: `**${monthData['n_record_likes']}** likes par ${auteurRecordLikesMemes} !` },
				{ name: "Record de likes cumulés :", value: `**${monthData['n_record_likes_cumules']}** likes par ${auteurRecordLikesCumules} !` },
				{ name: "Total de likes :", value: `${monthData['n_total_likes']}` },
				{ name: "Nombre de reposts :", value: `${monthData['n_count_reposts']}` },
				{ name: "Nombre de memes envoyés dans le feed :", value: `${monthData['n_memes_feed']}` },
				{ name: "Emoji la plus utilisée :", value: `${monthData['n_best_emoji']} avec **${monthData['n_count_best_emoji']}** utilisations !` }
			]);

		if ( this.client?.user?.username && typeof this.client.user.username === 'string' )
			embed.setAuthor( { name: this.client.user.username, iconURL: this.client.user.avatarURL() } );

		return embed;
	}

	/**
	 * Vérifie si le mois actuel a bien un ligne dans la table stats.
	 * @return {Promise<boolean>} Une Promesse complétée avec un booléen indiquant si un nouveau mois a été créé.
	 */
	async checkIfMonthExists() {
		const statsManager = this.db.statsManager;
		const currentMonth = await statsManager.fetchMonth( getMonthIntDate() );
		if ( currentMonth ) return false;

		await statsManager.createNewMonth();
		return true;
	}

	async addRepostToStats() {
		await this.db.query(
			"UPDATE stats SET n_count_reposts=n_count_reposts+1 WHERE pk_month_id=?",
			[ getMonthIntDate() ]
		);
	}

	/**
	 * Ajoute toutes les emojis de la table 'stats_emojis' à la table 'history_stats_emoji' et vide la table 'stats_emojis'.
	 * @param {number} month_id L'identifiant du mois qui est lié aux emojis de la table 'stats_emojis'.
	 */
	async transferStatsEmojisToHisto( month_id ) {
		const emojis = await this.db.query( "SELECT * FROM stats_emojis" );
		for ( let emoji of emojis ) {
			await this.db.query(
				"INSERT INTO history_stats_emojis VALUES (?,?,?)",
				[ emoji["pk_emoji"], emoji["n_count"], month_id ]
			);
		}

		await this.db.oneResultQuery( "DELETE FROM stats_emojis" );
	}

	/**
	 * Ajoute +1 au compteur de l'emoji dans la table 'stats_emojis'.
	 * @param {string} emoji La chaine de caractères permettant d'afficher l'emoji dans discord.
	 */
	async addEmojiCount( emoji ) {
		const queryResult = await this.db.query(
			"UPDATE stats_emojis SET n_count=n_count+1 WHERE pk_emoji=?",
			[ emoji ]
		);

		if ( !queryResult["affectedRows"] ) {
			await this.db.query(
				"INSERT INTO stats_emojis VALUES (?,?)",
				[ emoji, 1 ]
			);
		}
	}
}


module.exports = {
	Stats
}