import { supabase } from './config.js';
import { formatTanggalIndo } from './helper.js';

let daftarAnakParent = [];

window.loadParentDashboard = async function () {
  const user = JSON.parse(localStorage.getItem('anam_user') || '{}');
  document.getElementById('parent-greeting').innerText = `Halo, ${user.nama || 'Ayah/Bunda'}`;

  const { data } = await supabase
    .from('murid')
    .select('*')
    .eq('parent_user_id', user.id);

  daftarAnakParent = data || [];

  if (daftarAnakParent.length === 0) {
    document.getElementById('parent-card-sesi').innerHTML =
      `<p class="text-xs text-slate-500">Data siswa belum ditautkan ke akun ini. Silakan hubungi Admin.</p>`;
    return;
  }

  const wrapPilih = document.getElementById('parent-wrap-pilih');
  const selectAnak = document.getElementById('parent-select-anak');

  if (daftarAnakParent.length > 1) {
    wrapPilih.classList.remove('hidden');
    selectAnak.innerHTML = daftarAnakParent.map((a, idx) =>
      `<option value="${idx}">${a.nama_murid}</option>`
    ).join('');
  } else {
    wrapPilih.classList.add('hidden');
  }

  tampilkanDetailAnak(daftarAnakParent[0]);
};

window.gantiAnakParent = function () {
  const idx = document.getElementById('parent-select-anak').value;
  tampilkanDetailAnak(daftarAnakParent[idx]);
};

async function tampilkanDetailAnak(anak) {
  const sesi = anak.sisa_sesi ?? 0;
  const menipis = sesi <= 1;

  document.getElementById('parent-card-sesi').innerHTML = `
    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${anak.program}</div>
    <h2 class="text-xl font-extrabold text-anam-dark mt-0.5">${anak.nama_murid}</h2>

    <div class="my-4 py-4 px-6 rounded-2xl inline-block ${menipis ? 'bg-amber-50 border border-amber-200' : 'bg-sky-50 border border-sky-200'}">
      <div class="text-[11px] font-bold uppercase ${menipis ? 'text-amber-700' : 'text-anam-blue'}">Sisa Sesi Latihan</div>
      <div class="text-4xl font-black mt-1 ${menipis ? 'text-anam-orange' : 'text-anam-blue'}">${sesi}</div>
      <div class="text-[11px] text-slate-500 mt-1">Berlaku s/d <b>${formatTanggalIndo(anak.expired_sesi)}</b></div>
    </div>

    ${menipis ? `
      <div class="mt-2">
        <button onclick="chatAdmin('Halo Admin Anam Swimming Course, saya ingin konfirmasi perpanjangan sesi untuk ${anak.nama_murid}.')"
          class="w-full bg-anam-orange hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md text-xs transition">
          💬 Konfirmasi Perpanjangan ke Admin
        </button>
      </div>
    ` : ''}
  `;

  // Muat Histori Latihan
  const { data: histori } = await supabase
    .from('histori_latihan')
    .select('*')
    .eq('id_murid', anak.id_murid)
    .order('id', { ascending: false })
    .limit(15);

  const listHistori = document.getElementById('parent-list-histori');
  if (!histori || histori.length === 0) {
    listHistori.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Belum ada riwayat latihan tercatat.</p>`;
    return;
  }

  listHistori.innerHTML = histori.map((h) => `
    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex justify-between items-start gap-2">
      <div>
        <div class="font-bold text-anam-dark">${h.materi || 'Latihan Reguler'}</div>
        <div class="text-[11px] text-slate-500 mt-0.5">Pelatih: ${h.nama_coach || '-'}</div>
      </div>
      <span class="text-[11px] font-bold text-anam-blue shrink-0">${formatTanggalIndo(h.tanggal)}</span>
    </div>
  `).join('');
}
