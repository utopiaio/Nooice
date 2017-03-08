const start = require('./../commands/start');
const list = require('./../commands/list');
const location = require('./../commands/location');
const approve = require('./../commands/approve');
const pending = require('./../commands/pending');
const disapprove = require('./../commands/disapprove');
const ndelete = require('./../commands/delete');
const date = require('./../commands/date');
const geezer = require('./../commands/geezer');
const register = require('./../commands/register');
const unregister = require('./../commands/unregister');
const locationFreeloader = require('./../commands/locationFreeloader');

// all will happen inside a `message` - middleware will be applied
// to break the monolithic crap here
module.exports = (bot, config, moedoo) => (msg) => {
  // // 9:14 launch...
  // // PS: `!` is difficult to notice; so I prefer === false
  // if (config.NOOICE.includes(msg.from.id) === false) {
  //   bot.sendMessage(msg.chat.id, 'Ask Siri about 9:14');
  //   return;
  // }

  if (Object.prototype.hasOwnProperty.call(msg, 'location')) {
    /**
     * there's a 64 byte limit on `callback_data` hence the single letter types
     *
     * S: Send me nearest ATM
     * A: Add new ATM location
     * N: NOOICE!
     */
    bot.sendChatAction(msg.chat.id, 'typing');

    moedoo
      .query('SELECT nooice_id FROM nooice WHERE nooice_id=$1', [msg.from.id])
      .then((contributors) => {
        if (contributors.length === 1) {
          bot.sendMessage(msg.chat.id, 'NOOICE! 📍', {
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{ text: 'Send me the nearest 🏧 📍', callback_data: JSON.stringify({ type: 'S', l: msg.location }) }],
                [{ text: '😇 Register an 🏧 📍', callback_data: JSON.stringify({ type: 'A', l: msg.location }) }],
                [{ text: 'Just say NOOICE!', callback_data: JSON.stringify({ type: 'N' }) }],
              ],
            }),
          });

          return;
        }

        locationFreeloader(config, bot, msg, moedoo);
      }, () => {
        bot.sendMessage(msg.chat.id, 'NOOICE?');
      });

    return;
  }

  // /start
  if (msg.text === '/start') {
    start(bot, msg);
    return;
  }

  // message contains NOOICE (but no location) --- sending a NOOICE back!
  if (msg.text.search(/nooice/i) > -1) {
    bot.sendChatAction(msg.chat.id, 'typing');

    bot.sendMessage(msg.chat.id, 'NOOICE!');
    return;
  }

  if (msg.text.search(/da(y|te)/i) > -1) {
    date(bot, msg);
    return;
  }

  if (msg.text.search(/^\d+$/) > -1) {
    geezer(bot, msg);
    return;
  }

  if (msg.text === '/register') {
    register(bot, msg, moedoo);
    return;
  }

  if (msg.text === '/unregister') {
    unregister(bot, msg, moedoo);
    return;
  }

  // NOOICE 👑 actions
  if (config.NOOICE.includes(msg.from.id)) {
    if (msg.text === '/list') {
      list(bot, msg, moedoo);
      return;
    }

    if (msg.text === '/pending') {
      pending(bot, msg, moedoo);
      return;
    }

    if (msg.text.search(/^\/location_\d+$/) === 0) {
      location(bot, msg, moedoo);
      return;
    }

    if (msg.text.search(/^\/approve_\d+$/) === 0) {
      approve(bot, msg, moedoo);
      return;
    }

    if (msg.text.search(/^\/disapprove_\d+$/) === 0) {
      disapprove(bot, msg, moedoo);
      return;
    }

    if (msg.text.search(/^\/delete_\d+$/) === 0) {
      ndelete(bot, msg, moedoo);
      return;
    }
  }

  bot.sendChatAction(msg.chat.id, 'typing');

  // message does not contain NOOICE!, sending NOOICE request
  bot.sendMessage(msg.chat.id, 'NOOICE?', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Send 📍', request_location: true }],
        [{ text: 'ቀን / Date' }, { text: 'NOOICE!' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    }),
  });
};
