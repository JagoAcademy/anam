import { supabase } from './config.js';
import { getTodayLocalISO, formatHariTanggalLengkap } from './helper.js';

let muridCoachCache = [];
let logCoachCache = [];
let tabCoachAktif = 'murid';

window.loadCoachDashboard = async function () {
  const user = JSON.parse(localStorage.getItem('anam_user') || '{}');
  document.getElementById('coach-greeting').innerText = `Halo, ${user.nama || 'Coach'}`;

  const [{ data: muridData }, { data: logData }] = await Promise.all([
    supabase.from('murid').select('*').eq('status', 'Aktif').order('nama_murid', { ascending: true }),
    supabase.from('histori_latihan').select('*, murid(nama_murid, no_wa)').order('id', { ascending: false }).limit(50)
  ]);

  muridCoachCache = muridData || [];
  logCoachCache = logData || [];

  window.renderMuridCoach();
  window.renderLogCoach();
};

window.setTabCoach = function (tab) {
  tabCoachAktif = tab;
  const btnMurid = document.getElementById('coach-tab-murid');
  const btnLog = document.getElementById('coach-tab-log');
  const listMurid = document.getElementById('coach-list-murid');
  const listLog = document.getElementById('coach-list-log');

  if (tab === 'murid') {
    btnMurid.className = 'flex-1 py-2 rounded-xl bg-anam-blue text-white text-xs font-bold transition';
    btnLog.className = 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold transition';
    listMurid.classList.remove('hidden');
    listLog.classList.add('hidden');
  } else {
    btnLog.className = 'flex-1 py-2 rounded-xl bg-anam-blue text-white text-xs font-bold transition';
    btnMurid.className = 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold transition';
    listLog.classList.remove('hidden');
    listMurid.classList.add('hidden');
  }
};

window.handleSearchCoach = function () {
  if (tabCoachAktif === 'murid') window.renderMuridCoach();
  else window.renderLogCoach();
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
        <button onclick="bukaModalAssesment(${m.id_murid})"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition ${habis ? 'bg-slate-100 text-slate-400' : 'bg-anam-blue hover:bg-blue-800 text-white shadow-sm'}">
          ${habis ? 'Sesi Habis' : '📝 Assesment (-1)'}
        </button>
      </div>
    `;
  }).join('');
};

window.renderLogCoach = function () {
  const container = document.getElementById('coach-list-log');
  const keyword = (document.getElementById('coach-cari-murid')?.value || '').toLowerCase();

  const filtered = logCoachCache.filter((item) => {
    const nama = (item.nama_murid || item.murid?.nama_murid || '').toLowerCase();
    const coach = (item.nama_coach || '').toLowerCase();
    return nama.includes(keyword) || coach.includes(keyword);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">Belum ada log assesment tercatat.</div>`;
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const namaMurid = item.nama_murid || item.murid?.nama_murid || 'Murid';
    const hariTanggal = formatHariTanggalLengkap(item.tanggal);

    return `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-extrabold text-sm text-anam-dark">${namaMurid}</div>
            <div class="text-[11px] font-bold text-anam-blue mt-0.5">📅 ${hariTanggal}</div>
            <div class="text-[11px] text-slate-500">👨‍🏫 Nama Coach: <b>${item.nama_coach || '-'}</b></div>
          </div>
          <button onclick="kirimWaLogCoach(${item.id})" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm shrink-0">
            📲 Kirim WA
          </button>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <div class="font-bold text-anam-dark mb-0.5">Latihan hari ini :</div>
          <div class="leading-relaxed whitespace-pre-line">${item.materi || '-'}</div>
        </div>
      </div>
    `;
  }).join('');
};

window.kirimWaLogCoach = function (logId) {
  const item = logCoachCache.find((l) => l.id === logId);
  if (!item) return;

  window.kirimLogAssesmentWA({
    namaMurid: item.nama_murid || item.murid?.nama_murid || 'Murid',
    noWa: item.no_wa || item.murid?.no_wa || '',
    tanggal: item.tanggal,
    namaCoach: item.nama_coach,
    materi: item.materi,
    sisaSesi: item.sisa_sesi_setelah
  });
};

window.bukaModalAssesment = async function (idMurid) {
  let m = muridCoachCache.find((item) => item.id_murid === idMurid);

  if (!m) {
    const { data } = await supabase.from('murid').select('*').eq('id_murid', idMurid).single();
    m = data;
  }
  if (!m) return alert('Data murid tidak ditemukan.');

  const sesi = m.sisa_sesi ?? 0;
  if (sesi <= 0) {
    return alert(`Sisa sesi ${m.nama_murid} sudah 0. Hubungi Admin untuk konfirmasi perpanjangan!`);
  }

  const user = JSON.parse(localStorage.getItem('anam_user') || '{}');
  const todayISO = getTodayLocalISO();

  document.getElementById('ass-id-murid').value = m.id_murid;
  document.getElementById('ass-sisa-sekarang').value = sesi;
  document.getElementById('ass-no-wa').value = m.no_wa || '';
  document.getElementById('ass-nama-murid').value = m.nama_murid;
  document.getElementById('ass-info-sesi').innerText = `Sisa sesi: ${sesi} → menjadi ${sesi - 1} sesi`;
  document.getElementById('ass-coach').value = user.nama || 'Coach Anam';
  document.getElementById('ass-tanggal').value = todayISO;
  document.getElementById('ass-materi').value = '';

  window.updatePreviewHariAssesment();
  document.getElementById('modal-assesment-coach').classList.remove('hidden');
};

window.updatePreviewHariAssesment = function () {
  const tgl = document.getElementById('ass-tanggal').value;
  document.getElementById('ass-preview-hari').innerText = tgl ? `📅 ${formatHariTanggalLengkap(tgl)}` : '';
};

window.pilihPresetMateri = function (teks) {
  const area = document.getElementById('ass-materi');
  area.value = area.value.trim() ? `${area.value.trim()}, ${teks}` : teks;
  area.focus();
};

window.simpanAssesmentDanPotong = async function (kirimWa = false) {
  const idMurid = parseInt(document.getElementById('ass-id-murid').value);
  const namaMurid = document.getElementById('ass-nama-murid').value;
  const noWa = document.getElementById('ass-no-wa').value;
  const sesiSekarang = parseInt(document.getElementById('ass-sisa-sekarang').value) || 0;
  const namaCoach = document.getElementById('ass-coach').value.trim();
  const tanggal = document.getElementById('ass-tanggal').value;
  const materi = document.getElementById('ass-materi').value.trim();

  if (!materi) {
    alert('Wajib mengisi catatan "Latihan hari ini :" sebelum mengurangi sesi!');
    document.getElementById('ass-materi').focus();
    return;
  }

  const sisaBaru = Math.max(0, sesiSekarang - 1);

  const btn1 = document.getElementById('btn-simpan-ass');
  const btn2 = document.getElementById('btn-simpan-wa-ass');
  if (btn1) btn1.disabled = true;
  if (btn2) btn2.disabled = true;

  try {
    const { error: errMurid } = await supabase
      .from('murid')
      .update({ sisa_sesi: sisaBaru })
      .eq('id_murid', idMurid);

    if (errMurid) throw errMurid;

    const { error: errLog } = await supabase.from('histori_latihan').insert([{
      id_murid: idMurid,
      nama_murid: namaMurid,
      no_wa: noWa || null,
      nama_coach: namaCoach || 'Coach Anam',
      tanggal: tanggal || getTodayLocalISO(),
      materi,
      sisa_sesi_setelah: sisaBaru
    }]);

    if (errLog) throw errLog;

    window.tutupModal('modal-assesment-coach');

    if (kirimWa) {
      window.kirimLogAssesmentWA({
        namaMurid,
        noWa,
        tanggal,
        namaCoach,
        materi,
        sisaSesi: sisaBaru
      });
    } else {
      alert(`✅ Assesment tersimpan! Sisa sesi ${namaMurid} sekarang: ${sisaBaru} Sesi.`);
    }

    const user = JSON.parse(localStorage.getItem('anam_user') || '{}');
    if (user.role === 'admin' && typeof window.loadAdminDashboard === 'function') {
      window.loadAdminDashboard();
    }
    if (typeof window.loadCoachDashboard === 'function') {
      window.loadCoachDashboard();
    }
  } catch (err) {
    alert('Gagal menyimpan assesment: ' + err.message);
  } finally {
    if (btn1) btn1.disabled = false;
    if (btn2) btn2.disabled = false;
  }
};
