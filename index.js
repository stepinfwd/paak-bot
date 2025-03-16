const { Telegraf } = require('telegraf');
const axios = require('axios');
const dotenv = require('dotenv').config();
const data = require('./data.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

async function getRandomJoke () {
    try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        return response.data;
    } catch (error) {
        console.error('Error fetching joke:', error.message);
        return null;
    }
}

const SPECIAL_CHARS = [
    '\\', '_', '*', '[', ']', '(', ')', '~', '`', '>', '<', '&',
    '#', '+', '-', '=', '|', '{', '}', '.', '!'
];

const escapeMarkdown = (text) => {
    return SPECIAL_CHARS.reduce((acc, char) => acc.replaceAll(char, `\\${char}`), text);
};

bot.start((ctx) => {
    try {
        ctx.reply('Welcome! Use /joke to get a random joke or /algorithm <name>.');
    } catch (error) {
        console.error('Error in /start:', error.message);
        ctx.reply('Oops! Something went wrong. Try again later.');
    }
});

bot.help((ctx) => {
    try {
        ctx.reply('Use /joke to get a random joke or /algorithm <name>.');
    } catch (error) {
        console.error('Error in /help:', error.message);
        ctx.reply('Oops! Something went wrong. Try again later.');
    }
});

// Joke command
bot.command('joke', async (ctx) => {
    try {
        const joke = await getRandomJoke();
        if (joke) {
            ctx.replyWithMarkdownV2(`*${escapeMarkdown(joke.setup)}*\n\n${escapeMarkdown(joke.punchline)}`);
        } else {
            ctx.reply('Sorry, I couldn\'t fetch a joke at the moment. Please try again later.');
        }
    } catch (error) {
        console.error('Error in /joke:', error.message);
        ctx.reply('Oops! Something went wrong while fetching the joke. Try again later.');
    }
});

bot.command('algorithm', async (ctx) => {
    try {
        const query = ctx.message.text.split(' ')[1];
        if (!query) {
            return ctx.reply('Please specify an algorithm name. Usage: /algorithm <name>');
        }

        if (Object.keys(data.algorithms).includes(query)) {
            ctx.reply(data.algorithms[query]);
        } else {
            ctx.reply('Requested algorithm not available.');
        }
    } catch (error) {
        console.error('Error in /algorithm:', error.message);
        ctx.reply('Oops! Something went wrong while fetching the algorithm info.');
    }
});

// Handle unknown messages (including trolling response)
bot.on('message', (ctx) => {
    try {
        if (ctx.message.text.includes('paak ore mandan ane')) {
            ctx.reply('100% correct ane');
        } else {
            ctx.reply('Sorry, I don\'t understand that command. Use /joke or /algorithm <name>.');
        }
    } catch (error) {
        console.error('Error in message handler:', error.message);
        ctx.reply('An unexpected error occurred. Please try again later.');
    }
});

bot.catch((err, ctx) => {
    console.error('Bot encountered an error:', err);
    ctx.reply('An unexpected error occurred. Please try again later.');
});

bot.launch().then(() => {
    console.log('Bot is running...');
}).catch((error) => {
    console.error('Error launching bot:', error.message);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
