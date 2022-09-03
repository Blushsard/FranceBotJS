/**
 * @author Benjamin Guirlet
 * @description
 *      Permet de définir l'xp d'un utilisateur à la main.
 */
const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "set_xp" )
	.setDescription( "Permet de définir le nombre d'xp d'un utilisateur à la main." )
	.addUserOption( option =>
		option
			.setName( "user" )
			.setDescription( "L'utilisateur qui recevra la modification d'xp." )
			.setRequired( true )
	)
	.addNumberOption( option =>
		option
			.setName( "xp" )
			.setDescription( "Le nombre d'xp à ajouté." )
			.setRequired( true )
	)
	.setDefaultPermission(false);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	const usersManager = interaction.client.db.usersManager;
	const levels = interaction.client.modules.get( "levels" );
	const finalXp = interaction.options.getNumber( "xp" );

	const member = await interaction.guild.members.fetch( interaction.options.getUser( "user" ).id );
	let userDb = await usersManager.fetchUser( member.id );

	if ( !userDb ) {
		await usersManager.addUser(
			member.id,
			levels.getLevelFromXp( finalXp ),
			finalXp,
			0,
			0
		);
	}
	else {
		await usersManager.updateUser(
			interaction.options.getUser( "user" ).id,
			"n_xp",
			finalXp
		);
	}

	userDb = await usersManager.fetchUser( member.id );
	await levels.refreshUser( member, userDb );

	try {
		await interaction.reply({
			content: `L'xp de ${member} a été mise à ${finalXp}!`,
			ephemeral: true
		});
	}
	catch ( err ) { interaction.client.emit( "error", err ); }
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}