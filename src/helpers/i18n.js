const TelegrafI18n = require('telegraf-i18n');
const { resolve } = require('path');

const i18n = new TelegrafI18n({
  useSession: true,
  defaultLanguageOnMissing: true,
  directory: resolve(__dirname, "..", "..", "locales"),
});

module.exports = i18n;