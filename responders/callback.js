const moment = require('moment');

const browse = require('./../commands/browse');

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  const data = JSON.parse(callbackQuery.data);

  // avoid retyping for bad answerCallbackQuery nooices
  const cqBadNooice = () => {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  };

  switch (data.type) {
    case 'N':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
      return;

    case 'STY':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE', false);
      return;

    case 'NAV': {
      // first page
      if (data.c === 0 && data.d === -1) {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE Start', false);
        return;
      }

      // last page
      if (data.c + data.d === data.t) {
        bot.answerCallbackQuery(callbackQuery.id, 'NOOICE End', false);
        return;
      }

      const current = data.c + data.d;
      bot.answerCallbackQuery(callbackQuery.id, `NOOICE Showing ${current + 1}`, false);

      moedoo
        .query(`SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location, round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l[0]}, ${data.l[1]}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance FROM atm WHERE atm_approved = true ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l[0]}, ${data.l[1]}]}') LIMIT ${config.PER_PAGE} OFFSET ${current * config.PER_PAGE};`)
        .then((atms) => {
          const msg = atms.map(atm => `🏦 ${atm.atm_bank_name} 🏧\n📍 ${Number.parseInt(atm.atm_distance, 10).toLocaleString('us')} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}\n/location_${atm.atm_id}`).join('\n\n');

          bot.editMessageText(msg, {
            message_id: callbackQuery.message.message_id,
            chat_id: callbackQuery.message.chat.id,
            reply_markup: JSON.stringify({
              inline_keyboard: [[
                { text: '←', callback_data: JSON.stringify({ type: 'NAV', t: data.t, d: -1, c: current, l: data.l }) },
                { text: `${current + 1} of ${data.t}`, callback_data: JSON.stringify({ type: 'STY' }) },
                { text: '→', callback_data: JSON.stringify({ type: 'NAV', t: data.t, d: 1, c: current, l: data.l }) },
              ]],
            }),
          });
        });
      return;
    }

    // send nearest ATM
    case 'S':
      bot.sendChatAction(callbackQuery.message.chat.id, 'find_location');

      // preparing query is a bit _tricky_ (with the ST conversion n' all), so I'm going old school
      if (`${data.l.latitude} ${data.l.longitude}`.search(/^\d+\.\d+ \d+\.\d+$/) === 0) {
        moedoo
          .query(`SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location, round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l.latitude}, ${data.l.longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance FROM atm WHERE atm_approved = true ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.l.latitude}, ${data.l.longitude}]}') LIMIT 3;`)
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

      return;

    // add new ATM...
    case 'A': {
      bot.sendChatAction(callbackQuery.message.chat.id, 'typing');

      const { latitude, longitude } = callbackQuery.message.reply_to_message.location;
      const inlineKeyboard = config.BANKS.map((bank, index) => [{ text: bank, callback_data: JSON.stringify({ type: 'B', i: index, la: latitude, lo: longitude }) }]);

      moedoo
        .query(`SELECT atm_id FROM atm WHERE round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${latitude}, ${longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) <= ${config.THRESHOLD_REGISTER}`)
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

          bot.sendMessage(callbackQuery.message.chat.id, `NOOICE 🙌🏿\n\nThank you very much for your contribution, tho there's already an 🏧 registered within ${config.THRESHOLD_REGISTER} meters`);
        }, cqBadNooice);

      return;
    }

    // add new ATM [finalization]
    case 'B':
      bot.sendChatAction(callbackQuery.message.chat.id, 'typing');

      moedoo
        .query(`SELECT atm_id FROM atm WHERE round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) <= ${config.THRESHOLD_REGISTER}`)
        .then((rows) => {
          if (rows.length === 0) {
            moedoo
              .query(`INSERT INTO atm (atm_location, atm_bank_name, atm_approved) VALUES (ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), '${config.BANKS[data.i]}', false) returning atm_bank_name, atm_timestamp;`)
              .then((rowsInsert) => {
                if (rowsInsert.length === 1) {
                  bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
                  const atm = rowsInsert[0];

                  bot
                    .sendMessage(callbackQuery.message.chat.id, `NOOICE! 🎉\n\n🏦 ${atm.atm_bank_name}\n${moment(atm.atm_timestamp).format('MMMM DD, YYYY')}\n\nአመሰግናለው 🙌🏿\n\nPS\nThe moderators have been notified 📣`)
                    .then(() => {
                      bot.sendDocument(callbackQuery.message.chat.id, config.GIF, {
                        disable_notification: true,
                      });
                    });

                  return;
                }

                cqBadNooice();
              }, cqBadNooice);

            return;
          }

          cqBadNooice();
          bot.sendMessage(callbackQuery.message.chat.id, `NOOICE 🙌🏿\n\nThank you very much for your contribution, tho there's already an 🏧 registered within ${config.THRESHOLD_REGISTER} meters`);
        }, cqBadNooice);
      return;

    // alternate ATM
    case 'P':
      bot.sendChatAction(callbackQuery.message.chat.id, 'find_location');

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
      return;

    default:
      cqBadNooice();
  }
};
