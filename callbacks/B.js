const moment = require('moment');

module.exports = (config, bot, callbackQuery, moedoo) => {
  const data = JSON.parse(callbackQuery.data);
  const cqBadNooice = () => {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  };

  moedoo
    .query(`SELECT atm_id FROM atm WHERE atm_bank_name = $1 AND round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) <= ${config.THRESHOLD_REGISTER};`, [config.BANKS[data.i]])
    .then((rows) => {
      if (rows.length === 0) {
        moedoo
          .query(`INSERT INTO atm (atm_location, atm_bank_name, atm_approved) VALUES (ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${data.la}, ${data.lo}]}'), $1, false) returning atm_bank_name, atm_timestamp;`, [config.BANKS[data.i]])
          .then((rowsInsert) => {
            if (rowsInsert.length === 1) {
              bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
              const atm = rowsInsert[0];

              bot
                .editMessageText(`NOOICE! 🎉\n\n🏦 ${atm.atm_bank_name}\n${moment(atm.atm_timestamp).format('MMMM DD, YYYY')}\n\nአመሰግናለው 🙌🏿\n\nPS\nThe moderators have been notified 📣`, {
                  message_id: callbackQuery.message.message_id,
                  chat_id: callbackQuery.message.chat.id,
                })
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
      bot
        .editMessageText(`NOOICE 🙌🏿\n\nThank you very much for your contribution, tho there's already an 🏧 registered within ${config.THRESHOLD_REGISTER} meters`, {
          message_id: callbackQuery.message.message_id,
          chat_id: callbackQuery.message.chat.id,
        });
    }, cqBadNooice);
};
