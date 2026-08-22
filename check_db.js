/* Tez tekshiruv skripti: bazadagi dilerlarni va ularning login/parolini ko'rsatadi.
   Ishga tushirish:  node check_db.js
   .env faylidan o'qiydi (avval `npm i dotenv` kerak emas — o'zimiz o'qiymiz). */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function readEnv() {
  const file = path.join(__dirname, '.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = { ...readEnv(), ...process.env };
const url = env.REACT_APP_SUPABASE_URL;
const key = env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('.env da REACT_APP_SUPABASE_URL va REACT_APP_SUPABASE_ANON_KEY topilmadi.');
  process.exit(1);
}

createClient(url, key)
  .from('customers')
  .select('*')
  .then(({ data, error }) => {
    if (error) return console.error('Xato:', error.message);
    const dealers = (data || []).filter(c => c.type === 'dealer');
    if (!dealers.length) return console.log('Diler topilmadi.');
    console.log(`${dealers.length} ta diler:`);
    dealers.forEach(d => console.log(`  ${d.name} — login: ${d.login} · parol: ${d.password}`));
  });
