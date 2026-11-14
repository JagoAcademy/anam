import { supabase } from './config.js';
import { formatWA } from './helper.js';

function tampilkanWarning(pesan) {
  let box = document.getElementById('login-warning-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'login-warning-box';
    box.className = 'mt-3 p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold leading-relaxed';
    const passEl = document.getElementById('password') || document.getElementById('login-pass');
    if (passEl && passEl.parentElement) {
      passEl.parentElement.insertAdjacentElement('afterend', box);
    }
  }
  box.innerHTML = `⚠️ ${pesan}`;
  box.classList.remove('hidden');
}

function sembunyikanWarning() {
  const box = document.getElementById('login-warning-box');
  if (box) box.classList.add('hidden');
}

function arahkanSesuaiRole(user) {
  if (user.role === 'admin') {
    window.pindahHalaman('page-admin');
    if (typeof window.loadAdminDashboard === 'function') window.loadAdminDashboard();
  } else if (user.role === 'coach') {
    window.pindahHalaman('page-coach');
    if (typeof window.loadCoachDashboard === 'function') window.loadCoachDashboard();
  } else {
    window.pindahHalaman('page-parent');
    if (typeof window.loadParentDashboard === 'function') window.loadParentDashboard();
  }
}

window.prosesLogin = async function (event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  sembunyikanWarning();

  const userEl = document.getElementById('username') || document.getElementById('login-user');
  const passEl = document.getElementById('password') || document.getElementById('login-pass');

  if (!userEl || !passEl) {
    const msg = 'Form input username/password tidak ditemukan di index.html!';
    tampilkanWarning(msg);
    return alert(msg);
  }

  const rawInput = userEl.value.trim();
  const password = passEl.value.trim();

  if (!rawInput || !password) {
    tampilkanWarning('Username / No. HP dan Password wajib diisi!');
    return;
  }

  const btn = document.querySelector('button[onclick*="prosesLogin"]') || document.querySelector('#page-login button[type="submit"]');
  const teksAsli = btn ? btn.innerText : 'Masuk';
  if (btn) {
    btn.innerText = '⏳ Mengecek akun...';
    btn.disabled = true;
  }

  try {
    const cleanUser = rawInput.replace(/[,()]/g, '');
    const hpFormat = formatWA(cleanUser);

    let filter = `username.eq.${cleanUser}`;
    if (hpFormat.length >= 9) filter += `,no_wa.eq.${hpFormat}`;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(filter)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      tampilkanWarning(`Error Database (${error.code || 'DB'}): ${error.message}`);
      return;
    }

    if (!data) {
      tampilkanWarning('Akun tidak ditemukan atau password salah. (Pastikan tabel users sudah diisi & RLS Supabase tidak memblokir akses baca).');
      return;
    }

    localStorage.setItem('anam_user', JSON.stringify(data));
    arahkanSesuaiRole(data);
  } catch (err) {
    tampilkanWarning(`Error Sistem: ${err.message}`);
  } finally {
    if (btn) {
      btn.innerText = teksAsli;
      btn.disabled = false;
    }
  }
};

window.logout = function () {
  localStorage.removeItem('anam_user');
  const userEl = document.getElementById('username') || document.getElementById('login-user');
  const passEl = document.getElementById('password') || document.getElementById('login-pass');
  if (userEl) userEl.value = '';
  if (passEl) passEl.value = '';
  sembunyikanWarning();
  window.pindahHalaman('page-login');
};

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('anam_user');
  if (saved) {
    try {
      arahkanSesuaiRole(JSON.parse(saved));
    } catch {
      localStorage.removeItem('anam_user');
    }
  }
});
