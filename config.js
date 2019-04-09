// database
const DB_HOST = '127.0.0.1';
const DB_USER = 'moe';
const DB_PASSWORD = '';
const DB_PORT = 5432;
const DB_NAME = 'nooice';

// app
const APP_HOST = '0.0.0.0';
const APP_PORT = '8000';

// 👑 users that have administrator privileges
const NOOICE = [
  266005847, // @utopiaio
];

// Nooice
const GIF = 'http://i.giphy.com/PhKhSXofSAm3e.gif';

const PER_PAGE = 5;

// BANKS - Nemo! 🙌
const BANKS = [
  'Abay Bank',
  'Addis International Bank',
  'Awash International Bank',
  'Bank of Abyssinia',
  'Berhan International Bank',
  'Bunna International Bank',
  'Commercial Bank of Ethiopia',
  'Construction and Business Bank',
  'Cooperative Bank of Oromia',
  'Dashen Bank',
  'Debub Global Bank',
  'Development Bank of Ethiopia',
  'Enat Bank',
  'Lion International Bank',
  'Nib International Bank',
  'Oromia International Bank',
  'United Bank',
  'Wegagen Bank',
  'Zemen Bank',
];

// threshold in meters to disable search and re-submission
const THRESHOLD = 500;
const THRESHOLD_REGISTER = 100;

module.exports = {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_NAME,

  APP_HOST,
  APP_PORT,

  NOOICE,

  GIF,

  PER_PAGE,

  BANKS,

  THRESHOLD,
  THRESHOLD_REGISTER,
};
