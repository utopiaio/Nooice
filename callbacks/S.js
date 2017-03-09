const browse = require('./../commands/browse');

module.exports = (config, bot, callbackQuery, moedoo) => {
  const data = JSON.parse(callbackQuery.data);
  const cqBadNooice = () => {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  };

  bot.sendChatAction(callbackQuery.message.chat.id, 'find_location');

  // preparing query is a bit _tricky_ (with the ST conversion n' all), so I'm going old school
  if (`${data.l[0]} ${data.l[1]}`.search(/^\d+\.\d+ \d+\.\d+$/) === 0) {
    moedoo
      .query(`SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location, round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l[0]}, ${data.l[1]}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance FROM atm WHERE atm_approved = true ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l[0]}, ${data.l[1]}]}') LIMIT 3;`)
      .then((rows) => {
        // eslint-disable-next-line
        const atmsInRange = rows.filter(atm => Number.parseInt(atm.atm_distance, 10) <= config.THRESHOLD);

        if (rows.length === 0 || atmsInRange.length === 0) {
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE 😔', false);
          bot
            .sendMessage(callbackQuery.message.chat.id, `😔 Could not find an 🏧 within ${config.THRESHOLD} meters\n\nSo instead I'm going to send you all 🏧s ordered from nearest to furthest`)
            .then(() => {
              browse(config, bot, callbackQuery.message.chat.id, data.l, moedoo);
            });

          return;
        }

        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

        if (atmsInRange.length === 1) {
          bot
          .sendMessage(callbackQuery.message.chat.id, `NOOICE!\n\n🏦 ${atmsInRange[0].atm_bank_name} 🏧 is within ${atmsInRange[0].atm_distance} meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍`, { disable_notification: true })
          .then(() => {
            // eslint-disable-next-line
            bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1]);
          });

          return;
        }

        bot
          .sendMessage(callbackQuery.message.chat.id, `NOOICE!\n\n🏦 ${atmsInRange[0].atm_bank_name} 🏧 is within ${atmsInRange[0].atm_distance} meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍\n\nJust in case, I'll send you extra ${atmsInRange.length - 1} 🏧${atmsInRange.length - 1 > 1 ? 's that are' : ' that is'} within ${config.THRESHOLD} meters`, { disable_notification: true })
          .then(() => {
            const inlineKeyboard = atmsInRange.slice(1).map(atm => [{ text: `${atm.atm_distance} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}`, callback_data: JSON.stringify({ type: 'P', id: atm.atm_id }) }]);

            // eslint-disable-next-line
            bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1], {
              reply_markup: JSON.stringify({
                inline_keyboard: inlineKeyboard,
              }),
            });
          });
      }, cqBadNooice);
  } else {
    cqBadNooice();
  }
};
