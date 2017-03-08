module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  moedoo
    .query('DELETE FROM nooice WHERE nooice_id=$1 returning nooice_id;', [msg.from.id])
    .then((rows) => {
      bot.sendMessage(msg.chat.id, rows.length === 1 ? 'NOOICE 😔You\'ve successfully unregistered\n\nThank you for all your contributions. From now on whenever you send me your location I\'ll reply with nearby 🏧s' : 'NOOICE?\nYou have to register to unregister', {
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: 'Send 📍', request_location: true }],
            [{ text: 'ቀን / Date' }, { text: 'NOOICE!' }],
          ],
          resize_keyboard: true,
          one_time_keyboard: false,
        }),
      });
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE? Unable to unregister 😔');
    });
};
