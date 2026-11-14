import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pzduxtxfqyodjlquglbm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2tCuvJkuyFbRCEJeOx7FTg_8DvBpnso';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const CLUB_INFO = {
  nama: 'Anam Swimming Course',
  waAdmin: '6287852587960',
};
