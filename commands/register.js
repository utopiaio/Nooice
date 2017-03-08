module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  moedoo
    .query('INSERT INTO nooice (nooice_id) VALUES ($1)', [msg.from.id])
    .then(() => {
      bot.sendMessage(msg.chat.id, `NOOICE!
You are now a *contributor* 🙌🏿

Whenever you send me your location I'll ask you if you want to register an 🏧`, { parse_mode: 'Markdown' });
    }, () => {
      bot.sendMessage(msg.chat.id, `*DOUBLE NOOICE!*
Tho you're already a contributor 🙌🏿

To unregister send /unregister command`, { parse_mode: 'Markdown' });
    });
};
