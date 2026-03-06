const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Extract supabase URL and Key from src/utils/supabaseClient.js
const code = fs.readFileSync(path.join(__dirname, 'src', 'utils', 'supabaseClient.js'), 'utf8');
const urlMatch = code.match(/const supabaseUrl = '([^']+)'/);
const keyMatch = code.match(/const supabaseAnonKey = '([^']+)'/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('customers').select('*').then(({data, error}) => {
    if (error) console.error("Error:", error);
    else {
      console.log("Customers:");
      data.forEach(c => {
        if (c.type === 'dealer') {
          console.log(`Dealer: ${c.name}, login: '${c.login}', pwd: '${c.password}'`);
        }
      });
    }
  });
} else {
  console.log("Could not find supabase credentials");
}
