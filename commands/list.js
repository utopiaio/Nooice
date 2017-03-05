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
  `).then((rows) => {
    const message = rows.map(atm => `${atm.atm_bank_name}
${moment(atm.atm_timestamp).format('MMMM DD, YYYY')}
${atm.atm_approved ? '✅' : '⏳'}

/location_${atm.atm_id}
/approve_${atm.atm_id}
/disapprove_${atm.atm_id}
/delete_${atm.atm_id}`).join(`


`);
    bot.sendMessage(msg.chat.id, message, {
      reply_to_message_id: msg.message_id,
    });
  }, () => {
    bot.sendMessage(msg.chat.id, 'NOOICE?', {
      reply_to_message_id: msg.message_id,
    });
  });
};
