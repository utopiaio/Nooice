module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  const atmId = Number.parseInt(msg.text.match(/^\/disapprove_(\d+)$/)[1], 10);

  moedoo
    .query('UPDATE atm SET atm_approved = $1 WHERE atm_id = $2;', [false, atmId])
    .then(() => {
      bot.sendMessage(msg.chat.id, 'NOOICE 👍🏿');
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE?');
    });
};
