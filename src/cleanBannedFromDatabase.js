/**
 * @author Benjamin Guirlet
 * @description
 *      .
 */
/**
 * @author Benjamin Guirlet
 * @description
 *      Le point de base du bot.
 */
const { Client, Intents, Collection } = require( "discord.js" );
const { Database } = require( `${process.cwd()}/database/Database.js` );

require( "dotenv" ).config( { path: '.env.local' } );


const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS
	],
	partials: [
		"MESSAGE",
		"REACTION"
	]
});


function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}


client.on( 'ready', async () => {
	const guild = await client.guilds.fetch( process.env.GUILD_ID );
	let completeBanIdList = await (async (a = [], last = 0, limit = 1000) => {
		while(limit === 1000){
			let bans = await guild.bans.fetch({after: last, limit: limit});
			let banlist = bans.map(user => user.user.id);

			last = bans.last().user.id;
			limit = banlist.length;

			for(let i = 0; i < limit; i++){a.push(banlist[i]);}
		}

		return a;
	})();

	console.log( completeBanIdList )
	console.log( completeBanIdList.length )

	let cpt = 1;
	/*bans.forEach(( ban, key ) => {
		ban.fetch()
			.then( ban => {
				client.db.usersManager.removeUser( ban.user.id )
					.then( value => console.log( "USER DELETE ", cpt ) )
					.catch( reason => console.log( "USER ERREUR ", cpt ) )
			});
		cpt++;
		sleep( 500 );
	});
	*/
});



client.db = new Database( client );
client.login( process.env.TOKEN )
	.then( value => console.log( "connexion" ) );
