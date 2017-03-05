const { ge } = require('ethiopic-calendar');
const moment = require('moment');

/**
 * given Gregorian (en) weekday returns the Ethiopic dddd
 *
 * @param  {String} day
 * @return {String | null}
 */
function gregorianWeekdayToEthiopicWeekday(day) {
  const dddd = {
    Sunday: 'እሑድ',
    Monday: 'ሰኞ',
    Tuesday: 'ማክሰኞ',
    Wednesday: 'ረቡዕ',
    Thursday: 'ሐሙስ',
    Friday: 'ዓርብ',
    Saturday: 'ቅዳሜ',
  };

  return dddd[day] || null;
}

/**
 * given an Ethiopic month number returns Ethiopic MMMM
 *
 * @param {Number} month
 * @return {String | null}
 */
function ethiopicMonthToFullEthiopicMonth(month) {
  const MMMM = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];

  return MMMM[month - 1] || null;
}

module.exports = (bot, msg) => {
  const gCMoment = moment(msg.date, 'X');
  const ec = ge(gCMoment.year(), gCMoment.month() + 1, gCMoment.date());

  bot.sendMessage(msg.chat.id, `${ec.year}-${ec.month}-${ec.day}
${gregorianWeekdayToEthiopicWeekday(gCMoment.format('dddd'))}, ${ethiopicMonthToFullEthiopicMonth(ec.month)} ${ec.day}, ${ec.year}`);
};
