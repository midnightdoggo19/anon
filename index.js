require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Events,
    Partials,
    EmbedBuilder
} = require('discord.js');
const crypto = require('crypto');

const anonymousChannelID = process.env.ANONYMOUS_CHANNEL;
const roleName = process.env.ROLE_NAME;
const modChannelID = process.env.MOD_CHANNEL;
const token = process.env.DISCORD_TOKEN;
let inputChannelID = process.env.INPUT_CHANNEL; // cuz it can change
const avatarToken = process.env.AVATAR_TOKEN || Math.random();

if (!anonymousChannelID || !token) {
    console.log('Please set all required environment variables!');
    process.exit(1);
} if (!inputChannelID) {
    inputChannelID = anonymousChannelID // down here
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
})

const emojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
    '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
    '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️',  '🦂', '🐢',
    '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐚',
    '🦈', '🐋', '🐳', '🐬', '🐡', '🌿', '🌱', '🌳', '🌴', '🌵',
    '🌷', '🌹', '🌺', '🌻', '🌼', '🌸', '🌾', '🍀', '🍁', '🍄',
    '🌰', '🌲', '🐊', '🦢', '⚡️', '🔥', '💧', '🐟', '🐠', '🦌',
    '🐽', '🌪️',  '🌊', '🌬️',  '☀️',  '⛅', '🌈', '⚡', '❄️',  '💨',
    '🌁', '🌤️',  '🌥️',  '🌦️',  '🌧️',  '⛈️',  '🌩️',  '🌨️',  '🌫️',  '☁️',
    '🌋', '🌍', '🌎', '🌏', '🪨', '🍂', '🍃'
];

function getAvatar (str) {
    const hashPwd = crypto.createHash('sha1').update(str + avatarToken).digest('hex');
    const i = parseInt('0x' + hashPwd) % emojis.length;
    return emojis[i];
}

client.once(Events.ClientReady, () => { console.log('Bot turned on'); });

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const channel = message.channel;
    const anonymousChannel = await client.channels.fetch(anonymousChannelID);
    const modChannel = await client.channels.fetch(modChannelID);
    
    const replyAuthorUsername = message.author.username;
    let anonEmbed;
    let logEmbed;

    const r = Math.floor(Math.random() * 100000);
    const d = new Date();
    const messageStamp = '#' + r + ' ' + d.toLocaleDateString();

    if (channel.id !== inputChannelID) return;
    if (roleName && message.member.roles.cache.some((role) => role.name === roleName)) return; // role blacklist

    try {
        anonEmbed = new EmbedBuilder()
            // .setColor('#117557ff')
            // .setTitle('Anonymous Message')
            
            .setAuthor({ name: getAvatar(message.author.id) })
            .setDescription(String(message.content))
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

    if(modChannel) {
        logEmbed = new EmbedBuilder()
            // .setColor('#117557ff')
            // .setTitle('Anonymous Message')
            
            .setAuthor({ name: replyAuthorUsername })
            .setDescription(String(message.content))
            // .addField('Stamp', messageStamp, true)

            .setTimestamp()

        modChannel.send({
            // content: '```\n' + replyAuthorUsername + '\n ' + messageStamp + '```\n' + message.content + replyInfo,
            // files: message.attachments.map((a) => a.url),
            embeds: [logEmbed]
        });
    }

    try {
        message.delete();
    } catch(error){
        console.error('Error deleting message:', error.message);
    }
});

client.login(token);
