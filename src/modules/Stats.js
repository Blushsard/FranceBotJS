/**
 * @author Benjamin Guirlet
 * @description
 *      Module gérant les statistiques mensuelles de France Memes.
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

	/**
	 * Vérifie si il y a eu un changement de mois, et dans ce cas, créée une nouvelle ligne pour les stats et envoie
	 * les stats du mois précédent dans le salon des stats.
	 * @param {string} delay Le délai entre chaque itération de la boucle en milliseconde.
	 */
	async checkMonth( delay ) {
		setInterval( async () => {
			let monthCreated = await this.checkIfMonthExists();

			// Si un nouveau mois a été créé, alors on envoi les stats du mois précédent.
			if ( monthCreated && this._active ) {
				await this.sendStats( monthCreated["pk_month_id"] - 1 );
			}
		}, Number( delay ) );
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

		// TODO repasser ces lignes pour utiliser les données de monthData.
		// const monthData = await this.getMonthData( monthId, monthBaseData );
		const monthEmbed = await this.createEmbed( monthBaseData, guild );

		// envoi de l'embed dans cette fonction.

		// Enregistrement des données du mois dans la bdd.
	}


	/**
	 * Renvoie l'objet monthBaseData avec les données complète du mois.
	 * @param {number} monthId L'identifiant du mois demandé.
	 * @param {object} monthBaseData Les données de bases du mois à compléter.
	 * @return {Promise<object>} L'objet contenant les données complètes du mois.
	 */
	async getMonthData( monthId, monthBaseData ) {

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

		return new MessageEmbed()
			.setTitle( `Statisques du mois de ${monthData['s_month']}` )
			.setColor( "RED" )
			.setAuthor( { name: this.client.user.username, iconURL: this.client.user.avatarURL() } )
			.addFields([
				{ name: "Nombre de memes envoyés :", value: `${monthData['n_memes_sent']}` },
				{ name: "Record de likes sur un meme :", value: `**${monthData['n_record_likes']}** likes par ${auteurRecordLikesMemes}` },
				{ name: "Record de likes cumulés :", value: `**${monthData['n_record_likes_cumules']}** likes par ${auteurRecordLikesCumules}` },
				{ name: "Total de likes :", value: `${monthData['n_total_likes']}` },
				{ name: "Nombre de reposts :", value: `${monthData['n_count_reposts']}` },
				{ name: "Nombre de memes envoyés dans le feed :", value: `${monthData['n_memes_feed']}` },
				{ name: "Emoji la plus utilisée :", value: `${monthData['n_best_emoji']}` }
			]);

		// TODO pour les tables pour le classement des emojis :
		//  une table qui contient le classement du mois actuel (paire emoji/count)
		//  et une table qui contient l'historique des classements (emoji/count/id_mois)
		//  Et le classement des emojis intégrés dans les stats.
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
}


module.exports = {
	Stats
}