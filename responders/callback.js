const NAV = require('./../callbacks/NAV');
const S = require('./../callbacks/S');
const A = require('./../callbacks/A');
const B = require('./../callbacks/B');
const P = require('./../callbacks/P');

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  const data = JSON.parse(callbackQuery.data);

  switch (data.type) {
    // NOOICE!
    case 'N':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
      return;

    // current page click
    case 'STY':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE', false);
      return;

    // navigation
    case 'NAV':
      NAV(config, bot, callbackQuery, moedoo);
      return;

    // send nearest ATM
    case 'S':
      S(config, bot, callbackQuery, moedoo);
      return;

    // add new ATM...
    case 'A':
      A(config, bot, callbackQuery);
      return;

    // add new ATM [finalization]
    case 'B':
      B(config, bot, callbackQuery, moedoo);
      return;

    // alternate ATM
    case 'P':
      P(config, bot, callbackQuery, moedoo);
      return;

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
