module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'find_location');

  const atmId = Number.parseInt(msg.text.match(/^\/location_(\d+)$/)[1], 10);

  moedoo
    .query('SELECT atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location FROM atm WHERE atm_id = $1', [atmId])
    .then((rows) => {
      if (rows.length === 1) {
        const atm = rows[0];

        bot.sendMessage(msg.chat.id, `🏦 ${atm.atm_bank_name}`, {
          disable_notification: true,
        }).then(() => {
          // eslint-disable-next-line
          bot.sendLocation(msg.chat.id, JSON.parse(atm.atm_location).coordinates[0], JSON.parse(atm.atm_location).coordinates[1]);
        });

        return;
      }

      bot.sendMessage(msg.chat.id, 'NOOICE?');
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE?');
    });
};
