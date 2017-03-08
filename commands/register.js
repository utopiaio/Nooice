module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  moedoo
    .query('INSERT INTO nooice (nooice_id) VALUES ($1)', [msg.from.id])
    .then(() => {
      bot.sendMessage(msg.chat.id, 'NOOICE! You are now a contributor 🙌🏿');
    }, () => {
      bot.sendMessage(msg.chat.id, 'DOUBLE NOOICE! You\'re already a contributor 🙌🏿');
    });
};
