// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    rules: {
      // "@shared/..." — veb ilova bilan umumiy papka (../src/utils).
      // Yo'lni Metro metro.config.js da hal qiladi, ESLint uni bilmaydi.
      'import/no-unresolved': ['error', { ignore: ['^@shared/'] }],
    },
  },
]);
