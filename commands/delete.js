module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  const atmId = Number.parseInt(msg.text.match(/^\/delete_(\d+)$/)[1], 10);

  moedoo
    .query('DELETE FROM atm WHERE atm_id=$1', [atmId])
    .then(() => {
      bot.sendMessage(msg.chat.id, 'NOOICE 👍🏿');
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE?');
    });
};
