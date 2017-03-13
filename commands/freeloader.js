const browse = require('./browse');

module.exports = (config, bot, msg, moedoo) => {
  moedoo
    .query(`SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location, round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${msg.location.latitude}, ${msg.location.longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance FROM atm WHERE atm_approved = true ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${msg.location.latitude}, ${msg.location.longitude}]}') LIMIT 3;`)
    .then((atms) => {
      // eslint-disable-next-line
      const atmsInRange = atms.filter(atm => Number.parseInt(atm.atm_distance, 10) <= config.THRESHOLD);

      if (atms.length === 0 || atmsInRange.length === 0) {
        bot
          .sendMessage(msg.chat.id, `😔 Could not find an 🏧 within ${config.THRESHOLD} meters\n\nSo instead I'm going to send you all 🏧s ordered from nearest to furthest`)
          .then(() => {
            browse(config, bot, msg.chat.id, [msg.location.latitude, msg.location.longitude], moedoo);
          });

        return;
      }

      if (atmsInRange.length === 1) {
        bot
          .sendMessage(msg.chat.id, `NOOICE!\n\n${config.NOOICE.includes(msg.from.id) ? `[${atmsInRange[0].atm_id}]` : '🏦'} ${atmsInRange[0].atm_bank_name} 🏧 is within ${atmsInRange[0].atm_distance} meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} from your 📍`, { disable_notification: true })
          .then(() => {
            // eslint-disable-next-line
            bot.sendLocation(msg.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1]);
          });

        return;
      }

      bot
        .sendMessage(msg.chat.id, `NOOICE!\n\n${config.NOOICE.includes(msg.from.id) ? `[${atmsInRange[0].atm_id}]` : '🏦'} ${atmsInRange[0].atm_bank_name} 🏧 is within ${atmsInRange[0].atm_distance} meter${Number.parseInt(atmsInRange[0].atm_distance, 10) > 1 ? 's' : ''} from your 📍\n\nJust in case, I'll send you extra ${atmsInRange.length - 1} 🏧${atmsInRange.length - 1 > 1 ? 's that are' : ' that\'s'} within ${config.THRESHOLD} meters`, { disable_notification: true })
        .then(() => {
          const inlineKeyboard = atmsInRange.slice(1).map(atm => [{ text: `${atm.atm_distance} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}`, callback_data: JSON.stringify({ type: 'P', id: atm.atm_id }) }]);

          // eslint-disable-next-line
          bot.sendLocation(msg.chat.id, JSON.parse(atmsInRange[0].atm_location).coordinates[0], JSON.parse(atmsInRange[0].atm_location).coordinates[1], {
            reply_markup: JSON.stringify({
              inline_keyboard: inlineKeyboard,
            }),
          });
        });
    }, () => {
      bot.sendMessage(msg.chat.id, 'NOOICE?');
    });
};
