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
const { Client, Collection, Message, TextChannel, DMChannel, GuildMember } = require( "discord.js" );


class Levels
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this._active = active;
		this.client = client;

		// Collection contenant les vérifications des différentes limitations par user.
		this.limits = new Collection();
	}

	getActive() { return this._active; }
	setActive( active ) { this._active = active; }


	/**
	 * Ajoute de l'expérience à un utilisateur suite à un message envoyé.
	 * Cette fonction doit être placée dans l'event messageCreate.
	 * @param {Message} message Le message envoyé par l'utilisateur.
	 * @param {object|null} channel Le salon de la base de données dans lequel le message a été envoyé.
	 */
	async ajouterExperienceMessage( message, channel ) {
		if ( !this._active || message.author.bot ) return;
		if ( channel && channel['b_exp'] ) return;
		if ( message.channel instanceof DMChannel ) return;	// On empêche les gens de gagner de l'xp avec les DM du bot.

		let user = null;
		const msTime = (new Date()).getTime();

		if ( this.limits.has( message.author.id ) ) {
			// 1 minute
			if ( msTime > this.limits.get( message.author.id ) + 60_000 ) {
				user = await this.client.db.usersManager.ajouterExperienceUser( message.author.id, 8 );
				this.limits.set( message.author.id, msTime );
			}
		}
		else {
			this.limits.set( message.author.id, msTime );
			user = await this.client.db.usersManager.ajouterExperienceUser( message.author.id, 8 );
		}

		if ( user ) {
			await this.levelUpUtilisateur( user, message.member, message.channel );
		}
	}


	/**
	 * Regarde si les rôles et niveau de l'utilisateur sont à jour et les met à jour si besoin.
	 * @param {GuildMember} member L'objet GuildMember de l'utilisateur à refresh.
	 * @param {object} userDb Les données de l'utilisateur dans la bdd.
	 */
	async refreshUser( member, userDb ) {
		// Refresh du niveau.
		if ( userDb['n_level'] !== this.getLevelFromXp( userDb['n_xp'] ) ) {
			userDb['n_level'] = this.getLevelFromXp(userDb['n_xp']);
			await this.client.db.usersManager.updateUser(userDb['pk_user_id'], 'n_level', userDb['n_level']);
		}

		// Refresh du progress
		await this.refreshProgressUser( userDb );

		// Refresh des roles.
		const guildRoles = await this.client.db.rolesLevelsManager.fetchGuildRoles( member.guild.id );
		for ( let role of guildRoles ) {
			if ( member.roles.cache.has( role['pk_role_id'] ) && role['n_niveau_requis'] > userDb['n_level'] )
				await member.roles.remove( role['pk_role_id'] )
			else if ( role['n_niveau_requis'] <= userDb['n_level'] )
				await member.roles.add( role["pk_role_id"] );
		}
	}


	/**
	 * fait monter de niveau un utilisateur si il a suffisamment d'exp.
	 * @param {object} user Un objet contenant les données de l'utilisateur de la bdd.
	 * @param {GuildMember} member L'objet GuildMember de l'author du message.
	 * @param {TextChannel} salon Le salon dans lequel envoyer le message de level up.
	 */
	async levelUpUtilisateur( user, member, salon ) {
		let userMention = await salon.guild.members.fetch( user["pk_user_id"] );
		if ( user ) {
			user["n_nb_messages"]++;

			// Vérification pour le level up.
			if ( this.getRequiredExpForLevel( user["n_level"] + 1 ) < user["n_xp"] ) {
				// Passage au niveau supérieur.
				user["n_level"]++;
				await this.client.db.usersManager.updateUser( user["pk_user_id"], "n_level", user["n_level"] );
				await salon.send(`Bravo ${userMention}! Tu es passé au niveau **${user['n_level']}**!`);

				// Ajout du nouveau rôle si nécessaire.
				const role = await this.client.db.rolesLevelsManager.fetchGuildRoleByLevel(
					member.guild.id, user["n_level"] );
				if ( role )
					await member.roles.add( role["pk_role_id"] );
			}

			await this.client.db.usersManager.updateUser(
				user["pk_user_id"], "n_nb_messages", user["n_nb_messages"] );
		}
	}


	/**
	 * Met à jour le progrès de l'utilisateur.
	 * @param {object} user Les données de l'utilisateur dans la base de données.
	 * @return {Promise<number>} Une Promise complétée avec le progrès de l'utilisateur.
	 */
	async refreshProgressUser( user ) {
		let progress;
		if ( user['n_level'] === 0 )
			progress = user['n_xp'] * 100 / this.getRequiredExpForLevel( user['n_level'] + 1 );
		else
			progress = ((user['n_xp'] - this.getRequiredExpForLevel( user['n_level'] )) * 100) /
				(this.getRequiredExpForLevel( user['n_level'] + 1 ) - this.getRequiredExpForLevel( user['n_level'] ));

		if ( user['n_progress'] !== progress )
			await this.client.db.usersManager.updateUser( user['pk_user_id'], 'n_progress', progress );
		return progress;
	}


	/**
	 * Calcule l'expérience requise pour un niveau donné.
	 * @param {int} level Le niveau pour lequel il faut calculer l'expérience requise.
	 * @return {int} L'expérience requise.
	 */
	getRequiredExpForLevel( level ) {
		return (5 * level**2 + 50) * level;
	}


	/**
	 * Calcule le niveau à partir de l'xp passée en paramètre.
	 * @param {int} xp L'xp du niveau à calculer.
	 * @return {int} Le niveau.
	 */
	getLevelFromXp( xp ) {
		let level = 0;
		while ( xp > this.getRequiredExpForLevel( level ) )	level++;
		return --level;
	}
}


module.exports = {
	Levels
}