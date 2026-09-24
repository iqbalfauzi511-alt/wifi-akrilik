const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: qrs } = await supabase.from('qr_codes').select('*').eq('code', 'CS-YAGHKF');
  if (qrs && qrs.length > 0) {
    const qr = qrs[0];
    await supabase.from('businesses').update({ wifiEnabled: true }).eq('id', qr.businessId);
    console.log('Fixed business wifi for CS-YAGHKF');
  }
}
run();
