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
          console.log(rows);
          bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
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

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
