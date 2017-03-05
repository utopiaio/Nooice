/* eslint no-console: 0 */
const start = require('./../commands/start');
const list = require('./../commands/list');
const location = require('./../commands/location');
const approve = require('./../commands/approve');
const disapprove = require('./../commands/disapprove');
const ndelete = require('./../commands/delete');

// all will happen inside a `message` - middleware will be applied
// to break the monolithic crap here
module.exports = (bot, config, moedoo) => (msg) => {
  console.log(msg);

  if (Object.prototype.hasOwnProperty.call(msg, 'location')) {
    /**
     * there's a 64 byte limit on `callback_data` hence the single letter types
     *
     * S: Send me nearest ATM
     * A: Add new ATM location
     * N: NOOICE!
     */
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

  // /start
  if (msg.text === '/start') {
    start(bot, msg);
    return;
  }

  // message contains NOOICE (but no location) --- sending a NOOICE back!
  if (msg.text.search(/nooice/i) > -1) {
    bot.sendMessage(msg.chat.id, 'NOOICE!');
    return;
  }

  if (config.NOOICE.includes(msg.from.id)) {
    if (msg.text === '/list') {
      list(bot, msg, moedoo);
      return;
    }

    if (msg.text.search(/^\/location_\d+$/) === 0) {
      location(msg, bot, moedoo);
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

  // message does not contain NOOICE!, sending NOOICE request
  bot.sendMessage(msg.chat.id, 'NOOICE?', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Send 📍', request_location: true }],
        [{ text: 'Just say NOOICE!' }],
      ],
      one_time_keyboard: true,
    }),
  });
};
