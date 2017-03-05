const moment = require('moment');

module.exports = (bot, config, moedoo) => (callbackQuery) => {
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
            bot.sendMessage(callbackQuery.message.chat.id, `😔 Could not find an 🏧 within *${config.THRESHOLD}* meters

💡
- Move around
- Get a better GPS lock
- NOOICE!
- nooice`, {
  parse_mode: 'Markdown',
});
            return;
          }

          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

          if (atmsInRange.length === 1) {
            bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE*!

*${atmsInRange[0].atm_bank_name}* 🏧 is within *${atmsInRange[0].atm_distance}* meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍`, {
  parse_mode: 'Markdown',
  disable_notification: true,
}).then(() => {
  // eslint-disable-next-line
  bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1]);
});
            return;
          }

          bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE*!

*${atmsInRange[0].atm_bank_name}* 🏧 is within *${atmsInRange[0].atm_distance}* meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} form your 📍

Just in case, I'll send you extra *${atmsInRange.length - 1}* 🏧${atmsInRange.length - 1 > 1 ? 's that are' : ' that is'} within *${config.THRESHOLD}* meters`, {
  parse_mode: 'Markdown',
  disable_notification: true,
}).then(() => {
  const inlineKeyboard = atmsInRange.slice(1).map(atm => [{ text: `🏧 within ${atm.atm_distance} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}`, callback_data: JSON.stringify({ type: 'P', id: atm.atm_id }) }]);
  // eslint-disable-next-line
  bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1], {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  });
});
        }, () => {
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
        });
      } else {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
      }

      return;

    case 'A': {
      const { latitude, longitude } = callbackQuery.message.reply_to_message.location;
      const inlineKeyboard = config.BANKS.map((bank, index) => [{ text: bank, callback_data: JSON.stringify({ type: 'B', i: index, la: latitude, lo: longitude }) }]);

      moedoo
        .query(`SELECT atm_id
                FROM atm
                WHERE round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${latitude}, ${longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) <= ${config.THRESHOLD_REGISTER}`)
        .then((rows) => {
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

          if (rows.length === 0) {
            bot.sendMessage(callbackQuery.message.chat.id, 'የማን ነው?', {
              reply_to_message_id: callbackQuery.message.reply_to_message.message_id,
              reply_markup: JSON.stringify({
                inline_keyboard: inlineKeyboard,
              }),
            });

            return;
          }

          bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE* 🙌🏿

*Thank you very much* for your contribution, tho there's already an 🏧 registered within *${config.THRESHOLD_REGISTER}* meters
`, {
  parse_mode: 'Markdown',
});
        }, () => {
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
        });

      return;
    }

    case 'B':
      moedoo
        .query(`SELECT atm_id
                FROM atm
                WHERE round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) <= ${config.THRESHOLD_REGISTER}`)
        .then((rows) => {
          if (rows.length === 0) {
            moedoo
              .query(`INSERT INTO atm (atm_location, atm_bank_name, atm_approved) VALUES (ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), '${config.BANKS[data.i]}', false) returning atm_bank_name, atm_timestamp;`)
              .then((rowsInsert) => {
                if (rowsInsert.length === 1) {
                  bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
                  const atm = rowsInsert[0];
                  bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE*! 🎉

*${atm.atm_bank_name}*
${moment(atm.atm_timestamp).format('MMMM DD, YYYY')}

አመሰግናለው 🙌🏿

PS
The moderators have been notified 📣
`, {
  parse_mode: 'Markdown',
}).then(() => {
  bot.sendDocument(callbackQuery.message.chat.id, config.GIF);
});
                  return;
                }

                bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
              }, () => {
                bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
              });

            return;
          }

          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
          bot.sendMessage(callbackQuery.message.chat.id, `*NOOICE* 🙌🏿

*Thank you very much* for your contribution, tho there's already an 🏧 registered within *${config.THRESHOLD_REGISTER}* meters
`, {
  parse_mode: 'Markdown',
});
        }, () => {
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
        });
      return;

    case 'P':
      moedoo.query(`
        SELECT atm_id,
               atm_bank_name,
               ST_AsGeoJSON(atm_location) as atm_location
        FROM atm
        WHERE atm_id = $1;
      `, [data.id]).then((rows) => {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);

        const atm = rows[0];
        bot
          .sendMessage(callbackQuery.message.chat.id, `*${atm.atm_bank_name}* 🏧`, {
            parse_mode: 'Markdown',
            disable_notification: true,
          })
          .then(() => {
            // eslint-disable-next-line
            bot.sendLocation(callbackQuery.message.chat.id, JSON.parse(atm.atm_location).coordinates[0], JSON.parse(atm.atm_location).coordinates[1]);
          });
      }, () => {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
      });
      return;

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
