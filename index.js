require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Events,
    Partials,
    EmbedBuilder
} = require('discord.js');
const crypto = require('crypto');

const anonymousChannel = process.env.ANONYMOUS_CHANNEL;
const roleName = process.env.ROLE_NAME;
const modChannel = process.env.MOD_CHANNEL;
const token = process.env.DISCORD_TOKEN;

if (!anonymousChannel || !token) {
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
    const d = new Date();
    const hashPwd = crypto.createHash('sha1').update(str + d.getDate()).digest('hex');
    const i = parseInt('0x' + hashPwd) % emojis.length;
    return emojis[i];
}

client.once(Events.ClientReady, () => { console.log('Bot turned on'); });

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const channel = message.channel;
    const r = Math.floor(Math.random() * 100000);
    const d = new Date();
    const messageStamp = '#' + r + ' ' + d.toLocaleDateString();

    if (channel.id !== anonymousChannel) return;
    if (roleName && message.member.roles.cache.some((role) => role.name === roleName)) return; // admin can't send anonymous messages
    await channelMessage(channel, message, messageStamp);
});

async function channelMessage(channel, message, messageStamp) {
    const replyAuthorUsername = message.author.username;
    let anonEmbed;
    let logEmbed;

        try {
            anonEmbed = new EmbedBuilder()
                // .setColor('#117557ff')
                // .setTitle('Anonymous Message')
                
                .setAuthor({ name: getAvatar(replyAuthorUsername) })
                .setDescription(String(message.content))
                // .addField('Stamp', messageStamp, true)

                .setTimestamp()

            channel.send({
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
        
        client.channels.fetch(modChannel).then((modChannel) => {
            modChannel.send({
                // content: '```\n' + replyAuthorUsername + '\n ' + messageStamp + '```\n' + message.content + replyInfo,
                // files: message.attachments.map((a) => a.url),
                embeds: [logEmbed]
            });
        });
    }

    try {
        message.delete();
    } catch(error){
        console.error('Error deleting message:', error.message);
    }

}

client.login(token);
