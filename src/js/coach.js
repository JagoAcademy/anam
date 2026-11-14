import { supabase } from './config.js';

let muridCoachCache = [];

window.loadCoachDashboard = async function () {
  const user = JSON.parse(localStorage.getItem('anam_user') || '{}');
  document.getElementById('coach-greeting').innerText = `Halo, ${user.nama || 'Coach'}`;

  const { data } = await supabase
    .from('murid')
    .select('*')
    .eq('status', 'Aktif')
    .order('nama_murid', { ascending: true });

  muridCoachCache = data || [];
  window.renderMuridCoach();
};

window.renderMuridCoach = function () {
  const container = document.getElementById('coach-list-murid');
  const keyword = (document.getElementById('coach-cari-murid')?.value || '').toLowerCase();

  const filtered = muridCoachCache.filter((m) =>
    m.nama_murid.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-center text-xs text-slate-400 py-8">Tidak ada murid ditemukan.</p>`;
    return;
  }

  container.innerHTML = filtered.map((m) => {
    const sesi = m.sisa_sesi ?? 0;
    const habis = sesi <= 0;

    return `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div>
          <div class="font-extrabold text-sm text-anam-dark">${m.nama_murid}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">
            Program: <b>${m.program}</b> · Sisa Sesi:
            <span class="font-extrabold ${habis ? 'text-red-500' : 'text-anam-blue'}">${sesi}</span>
          </div>
        </div>
        <button onclick="coachAbsenMurid(${m.id_murid}, '${m.nama_murid}', ${sesi})"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${habis ? 'bg-slate-100 text-slate-400' : 'bg-anam-blue hover:bg-blue-800 text-white shadow-sm'}">
          ${habis ? 'Sesi Habis' : '✅ Absen (-1)'}
        </button>
      </div>
    `;
  }).join('');
};

window.coachAbsenMurid = async function (idMurid, namaMurid, sesiSekarang) {
  if (sesiSekarang <= 0) return alert(`Sesi ${namaMurid} sudah habis (0). Minta admin untuk konfirmasi perpanjangan!`);

  const materi = prompt(`Absensi Latihan: ${namaMurid}\nMasukkan materi / catatan latihan hari ini:`, 'Latihan teknik dasar & pernapasan');
  if (materi === null) return;

  const user = JSON.parse(localStorage.getItem('anam_user') || '{}');

  const { error } = await supabase
    .from('murid')
    .update({ sisa_sesi: sesiSekarang - 1 })
    .eq('id_murid', idMurid);

  if (error) return alert('Gagal menyimpan absensi: ' + error.message);

  await supabase.from('histori_latihan').insert([{
    id_murid: idMurid,
    nama_coach: user.nama || 'Coach Anam',
    materi: materi || 'Latihan rutin'
  }]);

  alert(`✅ Absensi ${namaMurid} tercatat! Sisa sesi: ${sesiSekarang - 1}`);
  window.loadCoachDashboard();
};
