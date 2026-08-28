/* Babel sozlamasi.

   react-native-worklets plagini reanimated uchun shart va u RO'YXAT
   OXIRIDA turishi kerak — aks holda animatsiyalar ishlamaydi.
   Reanimated o'zi klaviatura kutubxonasi (react-native-keyboard-controller)
   uchun kerak: usiz ilova qurilmada ishga tushmaydi. */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
