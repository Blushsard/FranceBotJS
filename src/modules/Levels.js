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
const {
	Client,
	Collection,
	Message,
	TextChannel,
	DMChannel,
	GuildMember,
	VoiceState,
	StageChannel } = require( "discord.js" );


/**
 * Mini classe servant de structure pour enregistrer des donnees utilisateurs.
 */
class CreateUserLimitObject {
	constructor() {
		this.timeMsgLimit = 0;
		this.likeMsgCount = 0;
		this.dayLikeMsgCount = (new Date()).getDay();
		this.startTimeVocal = 0;
	}
}


/**
 * La classe principale du module.
 */
class Levels
{
	/**
	 * Le constructeur du module.
	 * @param {Client} client Le client du bot.
	 * @param {boolean} active Indique si le client est activé ou non.
	 */
	constructor( client, active ) {
		this.client = client;
		this._active = active;

		// Collection contenant les vérifications des différentes limitations par user.
		// Voir la fonction createUserLimitObject pour voir sous quelle forme se présente l'objet contenant les limites.
		this.limits = new Collection();
		this.guild = null;

		this.expMsgEnvoye = Number(process.env.EXP_MSG_ENVOYE);
		this.expLikeRecu = Number(process.env.EXP_LIKE_RECU);
		this.expFeed = Number(process.env.EXP_FEED);
		this.expRepost = Number(process.env.EXP_REPOST);
		this.expRepostAjoute = Number(process.env.EXP_REPOST_AJOUTE)
		this.expLikeAjoute = Number(process.env.EXP_LIKE_AJOUTE);
		this.expVocal = Number(process.env.EXP_VOCAL);
	}

	get active() { return this._active; }
	set active( active ) { this._active = active; }


	/**
	 * Permet de charger l'objet de la guild pour ne pas avoir à le fetch à chaque exp ajoutée.
	 */
	async loadGuildObject() {
		this.guild = await this.client.guilds.fetch( process.env.GUILD_ID );
	}


	/**
	 * Ajoute de l'expérience à un utilisateur.
	 * @param {GuildMember} member L'objet du membre qui reçoit de l'expérience.
	 * @param {TextChannel|DMChannel} channel Le salon dans lequel le membre a reçu de l'expérience.
	 * @param {number} exp Le nombre d'expérience reçu.
	 */
	async ajouterExperienceUtilisateur( member, channel, exp ) {
		const user = await this.client.db.usersManager.ajouterExperienceUser( member.id, exp );
		if ( user )
			await this.levelUpUtilisateur( user, member, channel );
	}


	/**
	 * Juste un wrapper pour simplifier le code dans la fonction du feed.
	 * Le salon n'est pas celui du feed mais le DM de l'auteur pour éviter de polluer le feed avec des messages de
	 * level up.
	 * @param {string} auteurId L'id de l'auteur du message qui a été envoyé dans le feed.
	 */
	async ajouterExperienceFeed( auteurId ) {
		if ( !this.guild ) return;

		const member = await this.guild.members.fetch( auteurId );
		await this.ajouterExperienceUtilisateur( member, await member.user.createDM( true ), this.expFeed );
	}


	/**
	 * Attribue ou non de l'experience en fonction du changement d'un voiceState d'un utilisateur.
	 * @param {VoiceState} oldState
	 * @param {VoiceState} newState
	 */
	async ajouterExperienceVocal( oldState, newState ) {
		if ( !this._active ) return;

		const voiceChannel = oldState.channel ?? newState.channel;
		if ( voiceChannel instanceof StageChannel || !voiceChannel.speakable ) return;

		let date = new Date();
		if ( this.limits.has( oldState.member.id ) ) {
			let userData = this.limits.get( oldState.member.id );

			// User entre dans un salon ou n'est plus muet.
			if ( (!oldState.channel && !newState.mute) || (oldState.mute && !newState.mute) )
				userData.startTimeVocal = date.getTime();

			// User quitte le salon ou devient muet, on lui donne son exp.
			else if ( (!newState.channel && (!newState.mute || !oldState.mute)) || (!oldState.mute && newState.mute) ) {
				// Si il n'a pas de temps en voc, alors on quitte.
				if ( !userData.startTimeVocal ) return;

				const timeDiff = date.getTime() - userData.startTimeVocal;
				const xpRecu = parseInt( String((this.expVocal * timeDiff) / 60_000_000 ), 10 );
				userData.startTimeVocal = 0;
				if ( xpRecu !== 0 )
					await this.ajouterExperienceUtilisateur( oldState.member, oldState.member.createDM(), xpRecu );
			}
		}
		else {
			let userData = new CreateUserLimitObject();
			if ( !oldState.channel && !newState.mute )
				userData.startTimeVocal = date.getTime();
			this.limits.set( oldState.member.id, userData );
		}
	}


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

		const msTime = (new Date()).getTime();
		if ( this.limits.has( message.author.id ) ) {
			// 1 minute
			if ( msTime >= this.limits.get( message.author.id ).timeMsgLimit + 60_000 ) {
				await this.ajouterExperienceUtilisateur( message.member, message.channel, this.expMsgEnvoye );
				this.limits.get( message.author.id ).timeMsgLimit = msTime;
			}
		}
		else {
			const userData = new CreateUserLimitObject();
			userData.timeMsgLimit = msTime;
			this.limits.set( message.author.id, userData );
			await this.ajouterExperienceUtilisateur( message.member, message.channel, this.expMsgEnvoye );
		}

		// Incrémentation du compteur de messages.
		await this.client.db.usersManager.incrementeCompteurMessagesUser( message.author.id );
	}


	/**
	 * Ajouter de l'exp à un utilisateur ayant ajouté un like à un meme.
	 * Il est cependant limité à 4xp par jour.
	 * @param {string} userId L'identifiant de l'utilisateur qui a ajouté le like.
	 * @param {TextChannel} channel Le salon du message.
	 * @param {boolean} upvote Indique si c'est un upvote ou downvote.
	 */
	async ajouterExperienceLikeAjoute( userId, channel, upvote ) {
		if ( !this._active ) return;
		const channelDb = await this.client.db.channelsManager.fetchChannel( channel.id );
		if ( channelDb && channelDb["b_exp"] ) return;

		let userLimits;
		if ( this.limits.has( userId ) ) {
			userLimits = this.limits.get( userId );
			if ( (new Date()).getDay() !== userLimits.dayLikeMsgCount ) {
				userLimits.dayLikeMsgCount = (new Date()).getDay();
				userLimits.likeMsgCount = 0;
			}

			if ( upvote ) {
				if ( userLimits.likeMsgCount === 10 ) return;
				userLimits.likeMsgCount++;
			}
			else if ( userLimits.likeMsgCount > 0 )
				userLimits.likeMsgCount--;
		}
		else {
			userLimits = new CreateUserLimitObject();
			if ( upvote )
				userLimits.likeMsgCount++;
			this.limits.set( userId, userLimits );
		}

		await this.client.modules.get( "levels" ).ajouterExperienceUtilisateur(
			await this.guild.members.fetch( userId ),
			channel,
			upvote ? this.expLikeAjoute : -this.expLikeAjoute
		);
	}


	/**
	 * Ajoute de l'exp à l'auteur d'un meme qui a reçu un like.
	 * @param {string} auteurId L'id de l'auteur du message qui a reçu le like.
	 * @param {string} channelId L'id du salon du message.
	 * @param {string} userId L'id de l'utilisateur qui a ajouté le like.
	 * @param {boolean} upvote Indique si c'est un upvote ou downvote.
	 */
	async ajouterExperienceLikeRecu( auteurId, channelId, userId, upvote ) {
		if ( !this._active ) return;
		if ( userId === auteurId ) return;
		if ( !this.guild ) return;
		const channelDb = await this.client.db.channelsManager.fetchChannel( channelId );
		if ( channelDb && channelDb["b_exp"] ) return;

		try {
			const channel = await this.guild.channels.fetch( channelId );
			const auteur = await this.guild.members.fetch( auteurId );
			await this.ajouterExperienceUtilisateur( auteur, channel, upvote ? this.expLikeRecu : -this.expLikeRecu );
		}
		catch ( err ) {}
	}


	/**
	 * Supprime de l'exp à un utilisateur si il reçoit un repost sur un meme.
	 * @param {GuildMember} auteur L'id de l'auteur qui vient de se prendre un repost.
	 * @param {TextChannel} channel L'id du salon contenant le meme.
	 * @param {boolean} upvote Indique si c'est un upvote ou downvote.
	 */
	async supprimerExperienceRepostAjoute( auteur, channel, upvote ) {
		const channelDb = await this.client.db.channelsManager.fetchChannel( channel.id );
		if ( channelDb && channelDb["b_exp"] ) return;
		await this.ajouterExperienceUtilisateur( auteur, channel, upvote ? -this.expRepostAjoute : this.expLikeRecu );
	}


	/**
	 * Supprime de l'exp à un utilisateur si un de ces messages est supprimé pour repost.
	 * @param {GuildMember} auteur L'id de l'auteur qui vient de se prendre un repost.
	 * @param {TextChannel} channel L'id du salon contenant le meme.
	 */
	async supprimerExperienceRepostSupprime( auteur, channel ) {
		const channelDb = await this.client.db.channelsManager.fetchChannel( channel.id );
		if ( channelDb && channelDb["b_exp"] ) return;
		await this.ajouterExperienceUtilisateur( auteur, channel, -this.expRepost );
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
		if ( user ) {
			// Vérification pour le level up.
			if ( this.getRequiredExpForLevel( user["n_level"] + 1 ) < user["n_xp"] ) {
				// Passage au niveau supérieur.
				user["n_level"]++;
				await this.client.db.usersManager.updateUser( user["pk_user_id"], "n_level", user["n_level"] );
				try {
					await salon.send(`Bravo ${member.user}! Tu es passé au niveau **${user['n_level']}**!`);
				} catch (err) {}

				// Ajout du nouveau rôle si nécessaire.
				const role = await this.client.db.rolesLevelsManager.fetchGuildRoleByLevel( member.guild.id, user["n_level"] );
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