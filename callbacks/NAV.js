module.exports = (config, bot, callbackQuery, moedoo) => {
  const data = JSON.parse(callbackQuery.data);

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
};
