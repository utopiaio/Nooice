/* eslint no-console: 0 */

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  console.log(callbackQuery);

  const data = JSON.parse(callbackQuery.data);

  switch (data.type) {
    case 'N':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
      return;

    case 'S':
      // preparing query is a bit _tricky_ (with the ST conversion n' all), so I'm going old school
      if (`${data.l.latitude} ${data.l.longitude}`.search(/^\d+\.\d+ \d+\.\d+$/) === 0) {
        moedoo.query(`
          SELECT atm_id,
                 atm_bank_name,
                 ST_AsGeoJSON(atm_location) as atm_location,
                 round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l.latitude}, ${data.l.longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance
          FROM atm
          WHERE atm_approved = true
          ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l.latitude}, ${data.l.longitude}]}')
          LIMIT 3;
        `).then((rows) => {
          // eslint-disable-next-line
          const atmsInRange = rows.filter(atm => Number.parseInt(atm.atm_distance, 10) <= config.THRESHOLD);

          if (rows.length === 0 || atmsInRange.length === 0) {
            bot.answerCallbackQuery(callbackQuery.id, 'NOOICE 😔', false);
            bot.sendMessage(callbackQuery.message.chat.id, `😔 Could not find an 🏧 within ${config.THRESHOLD} meters

Move around, get a better GPS lock and try gain`);
            return;
          }

          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

          if (atmsInRange.length === 1) {
            bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE*!

*${atmsInRange[0].atm_bank_name}* 🏧 is within *${atmsInRange[0].atm_distance}* meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍`, {
  parse_mode: 'Markdown',
});

            // intentional delay to _guarantee_ location is sent after message
            setTimeout(() => {
              // eslint-disable-next-line
              bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1]);
            }, 25);
            return;
          }

          bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE*!

*${atmsInRange[0].atm_bank_name}* 🏧 is within *${atmsInRange[0].atm_distance}* meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍

Just incase, I'm sending you extra *${atmsInRange.length - 1}* 🏧${atmsInRange.length - 1 > 1 ? 's' : ''} that are within *${config.THRESHOLD}* meters`, {
  parse_mode: 'Markdown',
});

          // intentional delay to _guarantee_ location is sent after message
          setTimeout(() => {
            const inlineKeyboard = atmsInRange.slice(1).map(atm => [{ text: `🏧 witin ${atm.atm_distance} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}`, callback_data: JSON.stringify({ type: 'P', id: atm.atm_id }) }]);
            // eslint-disable-next-line
            bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1], {
              reply_markup: JSON.stringify({
                inline_keyboard: inlineKeyboard,
              }),
            });
          }, 25);
        }, (err) => {
          console.log(err);
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
        });
      } else {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
      }

      return;

    case 'A':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
      bot.sendDocument(callbackQuery.message.chat.id, config.GIF);
      return;

    case 'P':
      moedoo.query(`
        SELECT atm_id,
               atm_bank_name,
               ST_AsGeoJSON(atm_location) as atm_location
        FROM atm
        WHERE atm_id = $1;
      `, [data.id]).then((rows) => {
        const atm = rows[0];
        bot.sendMessage(callbackQuery.message.chat.id, `*${atm.atm_bank_name}* 🏧`, { parse_mode: 'Markdown' });

        // intentional delay to _guarantee_ location is sent after message
        setTimeout(() => {
          // eslint-disable-next-line
          bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atm.atm_location).coordinates[0], JSON.parse(atm.atm_location).coordinates[1]);
        }, 25);
      }, (err) => {
        console.log(err);
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
      });
      return;

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
