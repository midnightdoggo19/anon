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
const avatarToken = process.env.AVATAR_TOKEN || Math.random(); // random unless told otherwise
const roleId = process.env.ROLEID;

let reactionChannel;
let reactionMessage;

const rest = new REST().setToken(token);

if (
    !anonymousChannelID ||
    !token ||
    !process.env.ID ||
    !process.env.GUILDID
) {
    console.log('Please set all required environment variables!'); // others optional
    process.exit(1);
}

let client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions
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
    const hashPwd = crypto.createHash('sha1').update(str + process.env.GUILDID + avatarToken).digest('hex');
    const i = parseInt('0x' + hashPwd) % emojis.length;
    return emojis[i];
}

// reduce, reuse, recycle
async function handleReaction(action, reaction, user) {
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    if (reaction.message.id != process.env.REACTIONMESSAGEID) return;

    // since we're really only dealing with one role
    // we don't need to care about which emoij's used
    // this can stay just in case though
    
    // const messageId = reaction.message.id;
    // const emoji = reaction.emoji.name;

    // this feels very scuffed but it does work
    const guild = client.guilds.fetch(process.env.GUILDID);
    const member = (await guild).members.fetch(user.id); // member as opposed to user
    const role = (await guild).roles.fetch(roleId);

    try {
        if (action === 'add') {
            (await member).roles.add(await role);
            console.log(`Added role ${roleId} to ${user.tag}`);
        } else if (action == 'remove') {
            (await member).roles.remove(await role);
            console.log(`Removed role ${roleId} from ${user.tag}`);
        } else console.error('You didn\'t say the magic word.');
    } catch (err) {
        console.error(`Failed to ${action} role:`, err);
    }
}

client.once(Events.ClientReady, async () => {
    console.log('Bot turned on');
    if (!process.env.REACTIONMESSAGEID || !process.env.ROLEID) console.log('Not running reaction roles as not all required enviornment variables are set!');
    else { // this has to be here; I checked
        reactionChannel = await client.channels.fetch(process.env.REACTIONCHANNELID); 
        reactionMessage = await reactionChannel.messages.fetch(process.env.REACTIONMESSAGEID);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'send') return;
    await interaction.deferReply({ flags: 64 });

    const anonymousChannel = await client.channels.fetch(anonymousChannelID);
    const modChannel = await client.channels.fetch(modChannelID);
    const theMessage = interaction.options.getString('message');
    
    let anonEmbed;
    let logEmbed;

    // if there is a role and you don't have it
    if (process.env.ROLEID && !interaction.member.roles.cache.has(process.env.ROLEID)) {
        await interaction.editReply(`You don\'t have the <@&${process.env.ROLEID}> role.`);

        return;
    }

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

client.on('messageReactionAdd', (reaction, user) => handleReaction('add', reaction, user));
client.on('messageReactionRemove', (reaction, user) => handleReaction('remove', reaction, user));

client.login(token);
