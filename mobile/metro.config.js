/* Metro sozlamasi.

   Mobil ilova veb ilova bilan bitta repoda turadi. Umumiy qoidalar
   (masalan qoldiq holati) ../src/utils da yotadi va shu yerdan
   to'g'ridan-to'g'ri import qilinadi — nusxa ko'chirilmaydi, shuning
   uchun veb va mobil hech qachon bir-biridan ajralib ketmaydi. */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');
const shared = path.resolve(repoRoot, 'src/utils');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [shared];

// Umumiy papkadagi fayl ../src/utils dan import qilinganda ham
// modullarni mobile/node_modules dan izlaymiz.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// "@shared/stock" → ../src/utils/stock.js
// extraNodeModules bu yerda ishlamaydi: "@shared/stock" nomi Metro
// uchun paket nomiga o'xshab ko'rinadi, shuning uchun yo'lni o'zimiz
// ko'rsatamiz.
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@shared/')) {
    return context.resolveRequest(
      context,
      path.join(shared, moduleName.slice('@shared/'.length)),
      platform
    );
  }
  return (defaultResolve || context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
