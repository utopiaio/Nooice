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
    bot.sendMessage(msg.chat.id, 'NOOICE! Got Your Location 📍', {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Send me the nearest 🏧 📍', callback_data: JSON.stringify({ type: 'S', l: msg.location }) }],
          [{ text: '😇 Resister an 🏧 📍', callback_data: JSON.stringify({ type: 'A', l: msg.location }) }],
          [{ text: 'Just say NOOICE!', callback_data: JSON.stringify({ type: 'N' }) }],
        ],
      }),
    });

    return;
  }

  // message contains nooice --- sending a nooice back!
  if (msg.text.search(/nooice/i) > -1) {
    bot.sendMessage(msg.chat.id, 'NOOICE!');
    return;
  }

  bot.sendMessage(msg.chat.id, 'NOOICE!', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Send Location', request_location: true }],
        [{ text: 'Just Say NOOICE!' }],
      ],
      one_time_keyboard: true,
    }),
  });
});

bot.on('callback_query', (callbackQuery) => {
  console.log(callbackQuery);
  const data = JSON.parse(callbackQuery.data);

  if (data.type === 'N') {
    bot.answerCallbackQuery(callbackQuery.id, 'Nooice!', true);
    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, 'Nooice!', false);
});

moedoo.query(`
  -- CREATE EXTENSION postgis;
`)
  .then(() => {
    console.log('nooice!');
  }, (err) => {
    console.log('nooice!', err);
  });
