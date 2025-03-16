const { Telegraf } = require('telegraf');
const axios = require('axios');
const dotenv = require('dotenv').config()
const data = require('./data.json');



const bot = new Telegraf(process.env.BOT_TOKEN);

async function getRandomJoke () {
    try {
        const joke = await axios.get('https://official-joke-api.appspot.com/random_joke')
        return joke.data
    } catch (error) {

        throw new Error('Unexpected error')
        return null
    }
}

const SPECIAL_CHARS = [
    '\\',
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '<',
    '&',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!'
]

const escapeMarkdown = (text) => {
    SPECIAL_CHARS.forEach(char => (text = text.replaceAll(char, `\\${char}`)))
    return text
}

bot.start((ctx) => ctx.reply('Welcome! Use /joke to get a random joke or /agorithm <name> '));
bot.help((ctx) => ctx.reply('Use /joke to get a random joke  or /agorithm <name> .'));

bot.command('joke', async (ctx) => {
    const joke = await getRandomJoke();
    if (joke) {
        ctx.replyWithMarkdownV2(`*${escapeMarkdown(joke.setup)}*\n\n${escapeMarkdown(joke.punchline)}`);
    } else {
        ctx.reply('Sorry, I couldn\'t fetch a joke at the moment. Please try again later.');
    }
});

bot.command('algorithm', async (ctx) => {
    const query = ctx.message.text.split(' ')[1]
    ctx.reply(Object.keys(data.algorithms).includes(query) ? data.algorithms[query] : 'Requestion algorithm not available');
});


// Handle unknown commands
bot.on('message', (ctx) => {
    //made bot with nick name of friend so trolling him in malayalam
    if (ctx.message.text.includes('paak ore mandan ane'))
        ctx.reply('100% correct ane');
    else
        ctx.reply('Sorry, I don\'t understand that command. Use /joke to get a random joke  or /agorithm <name> .');

});
bot.catch((err, ctx) => {
    console.error('error---', err);
    ctx.reply('An unexpected error occurred. Please try again later.');
});


bot.launch().then(() => {
    console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));