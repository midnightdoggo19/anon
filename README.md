# Stealth Bot

An anonymous chatting bot for Discord.

## Features
- Complete Anonymity: Chat anonymously on Discord without revealing your identity.
- Anonymous Message Forwarding: Send messages to a channel, and the bot will repost them anonymously to a designated channel.
- Moderator Visibility: Forwarded messages' authors are displayed in a separate channel, allowing moderators to see the original sender.

## How to use
- Deploy the bot and invite it to your server
- Create some channels:
    * A channel to send anonymized messages to
    * A channel to get those messages from (optional)
    * A log channel (optional)
- The users can be anonymous either by sending the messages directly to the output channel or a designated input channel. Either way, the orignal will be deleted.
- An example .env can be found [here](https://https://github.com/midnightdoggo19/anon/blob/main/.env.example).

## Development Environment Setup
### Clone the repo 
```
git clone https://github.com/midnightdoggo19/anon.git
```
### Install Dependencies
```
npm i
```

### Set up enviornment variables
- Set up a application from the [Discord Developer Portal](https://discord.com/developers/docs/game-sdk/applications)
- Refer [this](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
- Put the bot token in the .env

![image](https://github.com/FiniteLoop-NMAMIT/stealth-bot/assets/91735807/035d9161-9de9-4c03-9085-e76bb04911eb)

- Get the generated from the below URL and use to register the bot to your server

![image](https://github.com/FiniteLoop-NMAMIT/stealth-bot/assets/91735807/1c734f9c-1c3f-471d-9dbe-a6789966152e)

- Get the channel id of the anonymous channel and optionally log/mod channel id. Refer [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to get channel id
- Optionally you can a add role name that is ignored from anonymization

### Run the app
```
npm start
```

## License
[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)
