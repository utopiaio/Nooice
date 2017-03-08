module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  moedoo
    .query('DELETE FROM nooice WHERE nooice_id=$1', [msg.from.id])
    .then((rows) => {
      console.log(rows);
      bot.sendMessage(msg.chat.id, 'NOOICE 👍🏿');
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE? Unable to unregister 😔');
    });
};
