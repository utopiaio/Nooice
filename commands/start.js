module.exports = (bot, msg) => {
  bot.sendMessage(msg.chat.id, `*NOOICE*!

I am the bot that tells you where the nearest 🏧 is

The initiative of this bot is to map out *every* 🏧 in 🇪🇹 with the help of the community (and make everyone go broke in the process 😁)

The bot is *fully functional* with PostgreSQL + PostGIS and an approval system

All data will be released under [WTFPL](http://www.wtfpl.net/) License on GitHub

Let us make it happen 🙌🏿

Just send me your 📍 and I'll handle the rest

PS
Turn on your Wi-Fi to have better accuracy

PPS
To register an 🏧 please 🙏🏿 make sure your GPS accuray is within *20 meters*`, {
  parse_mode: 'Markdown',
  disable_web_page_preview: true,
});
};
