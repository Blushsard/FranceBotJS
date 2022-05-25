/**
 * @author Benjamin Guirlet
 * @description
 *      Le module gérant le système de niveau.
 *      Liste des actions donnant de l'expérience:
 *      	- message envoyé: 8xp
 *      	- ajouter un like à un meme: 4xp (limite: 10 par jour)
 *      	- obtenir un like sur un meme: 1xp
 *      	- meme dans le feed: 50xp
 *
 *      Liste des actions retirant de l'expérience:
 *      	- meme supprimé pour respost: -10xp
 */
const { Client, Collection, Message, TextChannel } = require( "discord.js" );


class Levels
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.active = active;
		this.client = client;

		// Collection contenant les vérifications des différentes limitations par user.
		this.limits = new Collection();
	}

	getActive() { return this.active; }
	setActive( active ) { this.active = active; }


	/**
	 * Ajoute de l'expérience à un utilisateur suite à un message envoyé.
	 * Cette fonction doit être placée dans l'event messageCreate.
	 * @param {Message} message Le message envoyé par l'utilisateur.
	 * @param {object} channel Le salon de la base de données dans lequel le message a été envoyé.
	 */
	async ajouterExperienceMessage( message, channel ) {
		if ( !this.active || message.author.bot || !channel['exp'] ) return;

		let user = null;
		const msTime = (new Date()).getTime();

		if ( this.limits.has( message.author.id ) ) {
			if ( msTime > this.limits.get( message.author.id ) + 60_000 ) {
				user = await this.client.db.usersManager.ajouterExperienceUser( message.author.id, 8 );
				this.limits.set( message.author.id, msTime );
			}
		}
		else {
			this.limits.set( message.author.id, msTime );
			user = await this.client.db.usersManager.ajouterExperienceUser( message.author.id, 8 );
		}

		if ( user ) await this.levelUpUtilisateur( user, message.channel );
	}


	/**
	 * fait monter de niveau un utilisateur si il a suffisamment d'exp.
	 * @param {object} user Un objet contenant les données de l'utilisateur de la bdd.
	 * @param {TextChannel} salon Le salon dans lequel envoyer le message de level up.
	 */
	async levelUpUtilisateur( user, salon ) {
		let userMention = await salon.guild.members.fetch( user["pk_user_id"] );
		if ( user ) {
			user["n_nb_messages"]++;

			// Vérification pour le level up.
			if ( this.getRequiredExpForLevel( user["n_level"] + 1 ) < user["n_xp"] ) {
				user["n_level"]++;
				await this.client.db.usersManager.updateUser( user["pk_user_id"], "n_level", user["n_level"] );

				await salon.send(`Brave ${userMention}! Tu es passé au niveau **${user['n_level']}**!`);
			}

			await this.client.db.usersManager.updateUser(
				user["pk_user_id"], "n_nb_messages", user["n_nb_messages"] );
		}
	}


	/**
	 * Calcule l'expérience requise pour un niveau donné.
	 * @param {int} level Le niveau pour lequel il faut calculer l'expérience requise.
	 * @return {int} L'expérience requise.
	 */
	getRequiredExpForLevel( level ) {
		return (5 * level**2 + 50) * level;
	}
}


module.exports = {
	Levels
}