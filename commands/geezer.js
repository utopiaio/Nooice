const geezer = require('geezer');

module.exports = (bot, msg) => {
  bot.sendChatAction(msg.chat.id, 'typing');

  bot.sendMessage(msg.chat.id, `${geezer(msg.text)}`, {
    reply_to_message_id: msg.message_id,
  });
};
