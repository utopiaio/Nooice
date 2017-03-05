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
const message = require('./responders/message.js');
const callbackQuery = require('./responders/callback.js');

const TOKEN = process.env.TELEGRAM_TOKEN;

const options = {
  webHook: {
    port: process.env.PORT,
  },
};
const bot = new TelegramBot(TOKEN, options);
const url = process.env.APP_URL || 'https://nooice.herokuapp.com:443';

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.on('message', message(bot, config, moedoo));
bot.on('callback_query', callbackQuery(bot, config, moedoo));

moedoo.query(`
  -- CREATE EXTENSION postgis;

  -- DROP TABLE atm; -- flush

  CREATE TABLE IF NOT EXISTS atm (
    atm_id serial NOT NULL,
    atm_location geometry, -- locaton
    atm_bank_name character varying(128) DEFAULT 'ATM'::character varying, -- bank
    atm_timestamp timestamp with time zone DEFAULT now(), -- creation timestamp
    atm_approved boolean DEFAULT false, -- approval status
    CONSTRAINT atm_pk PRIMARY KEY (atm_id)
  );

  -- test data
  -- INSERT INTO atm (atm_location, atm_bank_name, atm_approved) VALUES (ST_GeomFromGeoJSON('{"type": "point", "coordinates": [9.0199, 38.7969]}'), 'Commercial Bank of Ethiopia', true);
`)
  .then(() => {
    console.log('NOOICE! - DB READY');
  }, (err) => {
    console.log('NOOICE 😔', err);
  });
