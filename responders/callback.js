/* eslint no-console: 0 */

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  console.log(callbackQuery, moedoo);

  const data = JSON.parse(callbackQuery.data);

  if (data.type === 'N') {
    bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
};
