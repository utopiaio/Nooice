/* eslint no-console: 0 */

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  console.log(callbackQuery);

  const data = JSON.parse(callbackQuery.data);

  switch (data.type) {
    case 'N':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
      return;

    case 'S':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
      moedoo.query(`
        SELECT atm_bank_name,
              ST_AsGeoJSON(atm_location) as atm_location,
              round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [$1, $2]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance
        FROM atm
        ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [$1, $2]}')
        LIMIT 3;
      `, [data.l.latitude, data.l.longitude]).then((rows) => {
        console.log(rows);
      }, (err) => {
        console.log(err);
      });
      return;

    case 'A':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
      bot.sendDocument(callbackQuery.message.chat.id, config.GIF);
      return;

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
