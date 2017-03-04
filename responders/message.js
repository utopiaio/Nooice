/* eslint no-console: 0 */

// all will happen inside a `message` - middleware will be applied
// to break the monolithic crap here
module.exports = (bot, config, moedoo) => (msg) => {
  console.log(msg);

  if (Object.prototype.hasOwnProperty.call(msg, 'location')) {
    bot.sendMessage(msg.chat.id, 'NOOICE! got your 📍', {
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

  // message contains NOOICE --- sending a NOOICE back!
  if (msg.text.search(/nooice/i) > -1) {
    bot.sendMessage(msg.chat.id, 'NOOICE!');
    return;
  }

  bot.sendMessage(msg.chat.id, 'NOOICE!', {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Send 📍', request_location: true }],
        [{ text: 'Just say NOOICE!' }],
      ],
      one_time_keyboard: true,
    }),
  });
};
