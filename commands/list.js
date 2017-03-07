const moment = require('moment');

module.exports = (bot, msg, moedoo) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  moedoo.query(`
    SELECT atm_id,
           atm_bank_name,
           ST_AsGeoJSON(atm_location) as atm_location,
           atm_timestamp,
           atm_approved
    FROM atm
    ORDER BY atm_id DESC
  `).then((rows) => {
    const approvedATMs = rows.filter(atm => atm.atm_approved);
    const message = rows.slice(0, 10).map(atm => `${atm.atm_bank_name}
${moment(atm.atm_timestamp).utc().add(3, 'hours').format('MMMM DD, YYYY')}
${moment(atm.atm_timestamp).utc().add(3, 'hours').format('HH:mm:ss')}
${atm.atm_approved ? '✅' : '⏳'}

/location_${atm.atm_id}
/approve_${atm.atm_id}
/disapprove_${atm.atm_id}
/delete_${atm.atm_id}`).join(`


`);
    bot.sendMessage(msg.chat.id, message ? `${message}

✅ ${approvedATMs.length}
⏳ ${rows.length - approvedATMs.length}` : 'No 🏧 😔', {
  reply_to_message_id: msg.message_id,
});
  }, () => {
    bot.sendMessage(msg.chat.id, 'NOOICE?', {
      reply_to_message_id: msg.message_id,
    });
  });
};
