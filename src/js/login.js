import { supabase } from './config.js';

window.prosesLogin = async function () {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) return;

  // Mode Simulasi Lokal (jika Supabase belum diisi di .env)
  if (!supabase) {
    if (username === 'admin') {
      sessionStorage.setItem('anam_user', JSON.stringify({ nama: 'Admin Anam', role: 'admin' }));
      window.pindahHalaman('page-admin');
    } else if (username === 'coach') {
      sessionStorage.setItem('anam_user', JSON.stringify({ nama: 'Coach Anam', role: 'coach' }));
      window.pindahHalaman('page-coach');
    } else {
      sessionStorage.setItem('anam_user', JSON.stringify({ nama: 'Wali Siswa', role: 'parent' }));
      window.pindahHalaman('page-parent');
    }
    return;
  }

  // Koneksi ke tabel users Supabase (sesuaikan nama tabel Anda)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    alert('Username atau password salah!');
    return;
  }

  sessionStorage.setItem('anam_user', JSON.stringify(data));

  if (data.role === 'admin') window.pindahHalaman('page-admin');
  else if (data.role === 'coach') window.pindahHalaman('page-coach');
  else window.pindahHalaman('page-parent');
};

window.logout = function () {
  sessionStorage.removeItem('anam_user');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  window.pindahHalaman('page-login');
};
