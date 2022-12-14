/**
 * @author Benjamin Guirlet
 * @description
 *      Donne le status des modules et/ou des salons avec des fonctionnalités actives.
 */
const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { CommandInteraction, MessageEmbed } = require( "discord.js" );


/* ----------------------------------------------- */
/* COMMAND BUILD                                   */
/* ----------------------------------------------- */
const slashCommand = new SlashCommandBuilder()
	.setName( "status" )
	.setDescription( "Donne le status des modules et du salon dans lequel la commande est exécutée." )
	.setDefaultPermission(false);


/* ----------------------------------------------- */
/* FUNCTIONS                                       */
/* ----------------------------------------------- */
/**
 * Handler pour la SlashCommande.
 * @param {CommandInteraction} interaction L'interaction générée par l'exécution de la commande.
 */
async function execute( interaction ) {
	let embeds = [];

	const mod = interaction.client.modules;
	let embedDescription = "**Posts :**\n" +
		`${mod.get("likes").active ? ":green_circle:": ":red_circle:"} ${mod.get("likes").constructor.name}\n` +
		`${mod.get("reposts").active ? ":green_circle:": ":red_circle:"} ${mod.get("reposts").constructor.name}\n` +
		`${mod.get("moyenne").active ? ":green_circle:": ":red_circle:"} ${mod.get("moyenne").constructor.name}\n` +
		`${mod.get("feed").active ? ":green_circle:": ":red_circle:"} ${mod.get("feed").constructor.name}\n` +
		`${mod.get("threads").active ? ":green_circle:": ":red_circle:"} ${mod.get("threads").constructor.name}\n` +
		`${mod.get("vote").active ? ":green_circle:": ":red_circle:"} ${mod.get("vote").constructor.name}\n` +
		"\n**XP :**\n" +
		`${mod.get("levels").active ? ":green_circle:": ":red_circle:"} ${mod.get("levels").constructor.name}\n` +
		"\n**Social :**\n" +
		`${mod.get("reddit").active ? ":green_circle:": ":red_circle:"} ${mod.get("reddit").constructor.name}\n` +
		`${mod.get("twitter").active ? ":green_circle:": ":red_circle:"} ${mod.get("twitter").constructor.name}\n` +
		"\n**Logs :**\n" +
		`${mod.get("logs").active ? ":green_circle:": ":red_circle:"} ${mod.get("logs").constructor.name}\n` +
		`${mod.get("stats").active ? ":green_circle:": ":red_circle:"} ${mod.get("stats").constructor.name}\n`;

	embeds.push(
		new MessageEmbed()
			.setDescription( embedDescription )
			.setAuthor({
				name: "| État des modules",
				iconURL: interaction.user.avatarURL()
			})
	);

	const channelData = await interaction.client.db.channelsManager.fetchChannel( interaction.channelId );
	if ( channelData ) {
		embedDescription = "" +
			(channelData["b_likes"] ? ":green_circle:" : ":red_circle:") + " **Likes**\n" +
			(channelData["b_reposts"] ? ":green_circle:" : ":red_circle:") + " **Reposts**\n" +
			(channelData["b_threads"] ? ":green_circle:" : ":red_circle:") + " **Threads**\n" +
			(channelData["b_feed"] ? ":green_circle:" : ":red_circle:") + " **Feed**\n" +
			(channelData["b_stats"] ? ":green_circle:" : ":red_circle:") + " **Stats**\n" +
			(channelData["b_logs"] ? ":green_circle:" : ":red_circle:") + " **Logs**\n" +
			(channelData["b_exp"] ? ":red_circle:" : ":green_circle:") + " **Exp**\n" +
			(channelData["b_vote"] ? ":green_circle:" : ":red_circle:") + " **Vote**\n";
	}
	else {
		embedDescription = "" +
			":red_circle: **Likes**\n" +
			":red_circle: **Reposts**\n" +
			":red_circle: **Threads**\n" +
			":red_circle: **Feed**\n" +
			":red_circle: **Stats**\n" +
			":red_circle: **Logs**\n" +
			":red_circle: **Exp**\n" +
			":red_circle: **Vote**\n";
	}

	embeds.push(
		new MessageEmbed()
			.setDescription(embedDescription)
			.setAuthor({
				name: " | Fonctionnalités du salon",
				iconURL: interaction.user.avatarURL()
			})
	);

	try {
		if ( embeds.length === 0 )
			return await interaction.reply({ content: "Le salon n'est pas dans la base de données.", ephemeral: true})
		await interaction.reply({ embeds: embeds, ephemeral: true });
	}
	catch ( err ) {}
}


/* ----------------------------------------------- */
/* MODULE EXPORTS                                  */
/* ----------------------------------------------- */
module.exports = {
	data: slashCommand,
	execute
}