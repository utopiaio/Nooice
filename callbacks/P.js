module.exports = (config, bot, callbackQuery, moedoo) => {
  bot.sendChatAction(callbackQuery.message.chat.id, 'find_location');

  const data = JSON.parse(callbackQuery.data);
  const cqBadNooice = () => {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  };

  moedoo.query('SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location FROM atm WHERE atm_id = $1;', [data.id]).then((rows) => {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

    const atm = rows[0];
    bot
      .sendMessage(callbackQuery.message.chat.id, `🏦 ${atm.atm_bank_name} 🏧`, {
        disable_notification: true,
      })
      .then(() => {
        // eslint-disable-next-line
        bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atm.atm_location).coordinates[0], JSON.parse(atm.atm_location).coordinates[1]);
      });
  }, cqBadNooice);
};
