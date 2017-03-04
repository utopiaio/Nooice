/* eslint no-console: 0 */
const TelegramBot = require('node-telegram-bot-api');

const config = require('./config');
// moedoo returns a curry function
const moedoo = require('./lib/moedoo')(process.env.DATABASE_URL || {
  DB_USER: config.DB_USER,
  DB_PASSWORD: config.DB_PASSWORD,
  DB_HOST: config.DB_HOST,
  DB_PORT: config.DB_PORT,
  DB_NAME: config.DB_NAME,
});

const TOKEN = process.env.TELEGRAM_TOKEN;

const options = {
  webHook: {
    port: process.env.PORT,
  },
};
const bot = new TelegramBot(TOKEN, options);
const url = process.env.APP_URL || 'https://nooice.herokuapp.com:443';

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.on('message', (msg) => {
  console.log(msg);

  if (Object.prototype.hasOwnProperty.call(msg, 'location')) {
    bot.sendMessage(msg.chat.id, 'Nooice 🌍', {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Noice', callback_data: 'Nooice!' }],
          [{ text: 'Noice', callback_data: 'Nooice!' }],
        ],
      }),
    });

    return;
  }

  bot.sendMessage(msg.chat.id, 'Nooice!', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Get Nearest ATM', request_location: true }],
        [{ text: 'Upload ATM Location', request_location: true }],
        [{ text: 'Just Say Nooice!' }],
      ],
      one_time_keyboard: true,
    }),
  });
});

bot.on('callback', (msg) => {
  console.log(msg);
});

moedoo.query(`
  -- CREATE EXTENSION postgis;
`)
  .then(() => {
    console.log('nooice!');
  }, (err) => {
    console.log('nooice!', err);
  });
