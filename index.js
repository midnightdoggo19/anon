require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Events,
    Partials,
    EmbedBuilder,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const crypto = require('crypto');

const anonymousChannelID = process.env.ANONYMOUS_CHANNEL;
// const roleName = process.env.ROLE_NAME;
const modChannelID = process.env.MOD_CHANNEL;
const token = process.env.DISCORD_TOKEN;
const avatarToken = process.env.AVATAR_TOKEN || Math.random();

const rest = new REST().setToken(token);

if (
    !anonymousChannelID ||
    !token ||
    !process.env.ID ||
    !process.env.GUILDID
) {
    console.log('Please set all required environment variables!');
    process.exit(1);
}

let client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ] // for DM permissions
});

const commandSend = new SlashCommandBuilder()
	.setName('send')
	.setDescription('Anonymously send a message')
	.addStringOption((option) => option.setName('message').setDescription('The message to send').setRequired(true));

const emojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
    '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
    '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️',  '🦂', '🐢',
    '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐚',
    '🦈', '🐋', '🐳', '🐬', '🐡', '🌿', '🌱', '🌳', '🌴', '🌵',
    '🌷', '🌹', '🌺', '🌻', '🌼', '🌸', '🌾', '🍀', '🍁', '🍄',
    '🌰', '🌲', '🐊', '🦢', '⚡️', '🔥', '💧', '🐟', '🐠', '🦌',
    '🐽', '🌪️', '🌊', '🌬️', '☀️', '⛅', '🌈', '⚡', '❄️', '💨',
    '🌁', '🌤️', '🌥️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '🌫️', '☁️',
    '🌋', '🌍', '🌎', '🌏', '🪨', '🍂', '🍃'
];

(async () => {
	try {
		const data = await rest.put(Routes.applicationGuildCommands(process.env.ID, process.env.GUILDID), { body: [commandSend] });

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

function getAvatar (str) {
    const hashPwd = crypto.createHash('sha1').update(str + avatarToken).digest('hex');
    const i = parseInt('0x' + hashPwd) % emojis.length;
    return emojis[i];
}

client.once(Events.ClientReady, () => { console.log('Bot turned on'); });

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'send') return;
    await interaction.deferReply({ flags: 64 });

    const anonymousChannel = await client.channels.fetch(anonymousChannelID);
    const modChannel = await client.channels.fetch(modChannelID);
    const theMessage = interaction.options.getString('message');
    
    let anonEmbed;
    let logEmbed;

    // if (roleName && interaction.user.roles.cache.some((role) => role.name === roleName)) return; // role blacklist

    try {
        anonEmbed = new EmbedBuilder()

            .setAuthor({ name: getAvatar(interaction.user.id) })
            .setDescription(String(theMessage))
            .setTimestamp()

        anonymousChannel.send({
            embeds: [anonEmbed]
        });
    } catch (error) {
        console.error(error);
    }

    if (modChannel) {
        logEmbed = new EmbedBuilder()
            // note: you can't do spoilers in the author field

            .setDescription(String(theMessage))
            .addFields({ name: 'Author', value: '||' + interaction.user.username + '||' })
            .setTimestamp()

        modChannel.send({
            embeds: [logEmbed]
        });
    }

    // await interaction.editReply('Sent!');
    await interaction.deleteReply();
});

client.login(token);
