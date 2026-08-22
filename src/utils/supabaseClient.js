import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // createClient bo'sh qiymat bilan tushunarsiz xato beradi — sababini aniq aytamiz.
  throw new Error(
    'Supabase sozlanmagan. Loyiha ildizida .env fayl yarating va ichiga yozing:\n' +
    '  REACT_APP_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  REACT_APP_SUPABASE_ANON_KEY=eyJ...\n' +
    'Namuna uchun .env.example ga qarang. Fayl qo\'shilgach dev serverni qayta ishga tushiring.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
