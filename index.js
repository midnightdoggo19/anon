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
// let inputChannelID = process.env.INPUT_CHANNEL; // cuz it can change
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
} // if (!inputChannelID) {
    // inputChannelID = anonymousChannelID // down here
// }

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
	.addStringOption((option) => option.setName('message').setDescription('The message to send'));

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

    // console.log(anonymousChannel);

    // if (roleName && interaction.user.roles.cache.some((role) => role.name === roleName)) return; // role blacklist

    try {
        anonEmbed = new EmbedBuilder()
            // .setColor('#117557ff')
            // .setTitle('Anonymous Message')
            
            .setAuthor({ name: getAvatar(interaction.user.id) })
            .setDescription(String(theMessage))
            // .addField('Stamp', messageStamp, true)

            .setTimestamp()

        anonymousChannel.send({
            // content: '```\n' + getAvatar(replyAuthorUsername) + '\n ' + messageStamp + '```\n' + message.content,
            // files: message.attachments.map((a) => a.url),
            embeds: [anonEmbed]
        });
    } catch (error) {
        console.error(error);
    }

    if (modChannel) {
        logEmbed = new EmbedBuilder()
            // .setColor('#117557ff')
            // .setTitle('Anonymous Message')
            
            .setAuthor({name: "||" + interaction.user.username + "||"})
            .setDescription(String(theMessage))
            // .addField('Stamp', messageStamp, true)

            .setTimestamp()

        modChannel.send({
            // content: '```\n' + replyAuthorUsername + '\n ' + messageStamp + '```\n' + message.content + replyInfo,
            // files: message.attachments.map((a) => a.url),
            embeds: [logEmbed]
        });
    }

    await interaction.editReply('Sent!');
});

client.login(token);
