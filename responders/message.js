// all will happen inside a `message` - middleware will be applied
// to break the monolithic crap here
module.exports = bot => (msg) => {
  if (Object.prototype.hasOwnProperty.call(msg, 'location')) {
    /**
     * there's a 64 byte limit on `callback_data` hence the single letter types
     *
     * S: Send me nearest ATM
     * A: Add new ATM location
     * N: NOOICE!
     */
    bot.sendMessage(msg.chat.id, 'NOOICE! got your 📍', {
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
    bot.sendMessage(msg.chat.id, `NOOICE!

I am the bot that tells you where the nearest 🏧 is

The initiative of this bot is to map out every 🏧 in 🇪🇹 with the help of the community (and make everyone go broke in the process 😁)

The bot is **fully functional** with PostgreSQL + PostGIS and an approval system

All data will be released under WTFPL License on GitHub

Let us make it happen 🙌🏿

Just send me your 📍 and I'll handle the rest

PS
Turn on your Wi-Fi to have better accuracy

PPS
To register an 🏧 please 🙏🏿 make sure your GPS accuray is within 20 meters`);
    return;
  }

  // message contains NOOICE (but no location) --- sending a NOOICE back!
  if (msg.text.search(/nooice/i) > -1) {
    bot.sendMessage(msg.chat.id, 'NOOICE!');
    return;
  }

  // message does not contain NOOICE!, sending NOOICE request
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
