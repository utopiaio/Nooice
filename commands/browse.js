module.exports = (config, bot, chatId, location, moedoo) => {
  moedoo
    .query('SELECT count(atm_id) as atm_count from atm;')
    .then((atmsCount) => {
      const total = Math.ceil(Number.parseInt(atmsCount[0].atm_count, 10) / config.PER_PAGE);

      moedoo
        .query(`SELECT atm_id, atm_bank_name, ST_AsGeoJSON(atm_location) as atm_location, round(CAST(ST_Distance_Spheroid(atm_location, ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${location.latitude}, ${location.longitude}]}'), 'SPHEROID["WGS 84",6378137,298.257223563]') as numeric), 0) as atm_distance FROM atm WHERE atm_approved = true ORDER BY atm_location <-> ST_GeomFromGeoJSON('{"type": "point", "coordinates": [${location.latitude}, ${location.longitude}]}') LIMIT ${config.PER_PAGE};`)
        .then((atms) => {
          const msg = atms.map(atm => `🏦 ${atm.atm_bank_name} 🏧\n📍 ${Number.parseInt(atm.atm_distance, 10).toLocaleString('us')} meter${Number.parseInt(atm.atm_distance, 10) > 1 ? 's' : ''}\n/location_${atm.atm_id}`).join('\n\n');

          // t: total
          // d: delta
          // c: current
          // l: location
          bot.sendMessage(chatId, msg, {
            reply_markup: JSON.stringify({
              inline_keyboard: [[
                { text: '←', callback_data: JSON.stringify({ type: 'NAV', t: total, d: -1, c: 0, l: [location.latitude, location.longitude] }) },
                { text: `1 of ${total}`, callback_data: JSON.stringify({ type: 'STY' }) },
                { text: '→', callback_data: JSON.stringify({ type: 'NAV', t: total, d: 1, c: 0, l: [location.latitude, location.longitude] }) },
              ]],
            }),
          });
        }, () => {
          bot.sendMessage(chatId, 'NOOICE?');
        });
    }, () => {
      bot.sendMessage(chatId, 'NOOICE?');
    });
};
