import { supabase } from './config.js';
import { formatWA, formatRupiah, formatTanggalIndo } from './helper.js';

let daftarMuridCache = [];
let filterAktif = 'semua';

window.tutupModal = function (id) {
  document.getElementById(id)?.classList.add('hidden');
};

window.loadAdminDashboard = async function () {
  const { data: muridData, error } = await supabase
    .from('murid')
    .select('*, users(nama, username, no_wa)')
    .order('sisa_sesi', { ascending: true });

  if (error) return alert('Gagal memuat data murid: ' + error.message);

  daftarMuridCache = muridData || [];

  const { count: jmlCoach } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'coach');

  const perluTagih = daftarMuridCache.filter((m) => (m.sisa_sesi ?? 0) <= 1).length;

  document.getElementById('stat-murid').innerText = daftarMuridCache.length;
  document.getElementById('stat-tagih').innerText = perluTagih;
  document.getElementById('stat-coach').innerText = jmlCoach || 0;

  window.renderDaftarMurid();
};

window.setFilterMurid = function (mode) {
  filterAktif = mode;
  const tabSemua = document.getElementById('tab-semua');
  const tabTagih = document.getElementById('tab-tagih');

  if (mode === 'semua') {
    tabSemua.className = 'flex-1 py-2 rounded-xl bg-anam-blue text-white text-xs font-bold transition';
    tabTagih.className = 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold transition';
  } else {
    tabTagih.className = 'flex-1 py-2 rounded-xl bg-anam-orange text-white text-xs font-bold transition';
    tabSemua.className = 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold transition';
  }
  window.renderDaftarMurid();
};

window.renderDaftarMurid = function () {
  const container = document.getElementById('admin-list-murid');
  const keyword = (document.getElementById('cari-murid')?.value || '').toLowerCase();

  const filtered = daftarMuridCache.filter((m) => {
    const cocokNama = m.nama_murid.toLowerCase().includes(keyword) ||
      (m.nama_panggilan || '').toLowerCase().includes(keyword);
    const cocokFilter = filterAktif === 'semua' ? true : (m.sisa_sesi ?? 0) <= 1;
    return cocokNama && cocokFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">Tidak ada data murid pada filter ini.</div>`;
    return;
  }

  container.innerHTML = filtered.map((m) => {
    const sesi = m.sisa_sesi ?? 0;
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (sesi === 0) badgeClass = 'bg-red-50 text-red-600 border-red-200';
    else if (sesi <= 2) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

    const akunOrtu = m.users ? (m.users.no_wa || m.users.username) : 'Belum ditautkan';

    return `
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-extrabold text-sm text-anam-dark">${m.nama_murid}</span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-anam-blue border border-sky-200">${m.program || 'Reguler'}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeClass}">
              Sisa: ${sesi} Sesi
            </span>
          </div>
          <div class="text-[11px] text-slate-500">
            📱 WA: <b>${m.no_wa || '-'}</b> · ⏳ Exp: <b>${formatTanggalIndo(m.expired_sesi)}</b> · 🔑 Akun: ${akunOrtu}
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="potongSatuSesi(${m.id_murid}, '${m.nama_murid}', ${sesi})" class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-anam-dark text-[11px] font-bold transition" title="Absen / Kurangi 1 Sesi">
            -1 Sesi
          </button>
          <button onclick="bukaModalTagih(${m.id_murid})" class="px-3 py-2 rounded-xl bg-anam-orange hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-sm transition">
            💳 Tagih
          </button>
          <button onclick="bukaModalMurid(${m.id_murid})" class="px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-anam-blue text-[11px] font-bold transition">
            ✏️
          </button>
        </div>
      </div>
    `;
  }).join('');
};

// POTONG 1 SESI (ABSEN CEPAT ADMIN)
window.potongSatuSesi = async function (idMurid, namaMurid, sesiSekarang) {
  if (sesiSekarang <= 0) return alert(`Sisa sesi ${namaMurid} sudah 0. Klik Tagih untuk perpanjang!`);
  if (!confirm(`Absen hadir untuk ${namaMurid}?\nSisa sesi akan berkurang dari ${sesiSekarang} menjadi ${sesiSekarang - 1}.`)) return;

  const { error } = await supabase
    .from('murid')
    .update({ sisa_sesi: sesiSekarang - 1 })
    .eq('id_murid', idMurid);

  if (error) return alert('Gagal update sesi: ' + error.message);

  await supabase.from('histori_latihan').insert([{
    id_murid: idMurid,
    nama_coach: 'Admin Anam',
    materi: 'Sesi Latihan Reguler'
  }]);

  window.loadAdminDashboard();
};

// ==========================================
// FITUR KLIK TAGIH (WA & TOP-UP SESI)
// ==========================================
window.bukaModalTagih = function (idMurid) {
  const m = daftarMuridCache.find((item) => item.id_murid === idMurid);
  if (!m) return;

  document.getElementById('tagih-id-murid').value = m.id_murid;
  document.getElementById('tagih-sisa-sekarang').value = m.sisa_sesi ?? 0;
  document.getElementById('tagih-nama').value = m.nama_murid;
  document.getElementById('tagih-wa').value = m.no_wa || '';
  document.getElementById('tagih-program').value = m.program || 'Reguler';
  document.getElementById('tagih-nominal').value = m.program === 'Privat' ? 600000 : 350000;

  document.getElementById('modal-tagih').classList.remove('hidden');
};

window.prosesKirimTagihanWA = function () {
  const nama = document.getElementById('tagih-nama').value;
  const wa = formatWA(document.getElementById('tagih-wa').value);
  const program = document.getElementById('tagih-program').value;
  const tambahSesi = document.getElementById('tagih-tambah-sesi').value;
  const nominal = formatRupiah(document.getElementById('tagih-nominal').value);
  const sisaLama = document.getElementById('tagih-sisa-sekarang').value;

  if (!wa) return alert('Nomor WhatsApp wali murid masih kosong!');

  const infoRek = localStorage.getItem('anam_rekening') ||
    'Transfer ke Rekening Anam Swimming Course\n(Silakan konfirmasi bukti transfer ke Admin)';

  const pesan =
`Halo Ayah/Bunda dari *${nama}* 👋

Menginfokan bahwa sesi latihan renang ananda di *Anam Swimming Course* saat ini tersisa *${sisaLama} sesi*.

Berikut rincian perpanjangan paket berikutnya:
🏊‍♂️ *Program:* ${program} (+${tambahSesi} Sesi)
💰 *Total Tagihan:* *${nominal}*

${infoRek}

Terima kasih! 🙏`;

  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(pesan)}`, '_blank');
};

window.prosesLunasTopupSesi = async function () {
  const idMurid = document.getElementById('tagih-id-murid').value;
  const nama = document.getElementById('tagih-nama').value;
  const sisaLama = parseInt(document.getElementById('tagih-sisa-sekarang').value) || 0;
  const tambahSesi = parseInt(document.getElementById('tagih-tambah-sesi').value) || 4;
  const totalSesiBaru = sisaLama + tambahSesi;

  // Set expired otomatis +35 hari dari hari ini
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 35);
  const expISO = expDate.toISOString().split('T')[0];

  const { error } = await supabase
    .from('murid')
    .update({ sisa_sesi: totalSesiBaru, expired_sesi: expISO, status: 'Aktif' })
    .eq('id_murid', idMurid);

  if (error) return alert('Gagal update sesi: ' + error.message);

  window.tutupModal('modal-tagih');
  alert(`✅ Pembayaran ${nama} dikonfirmasi!\nSisa sesi sekarang: ${totalSesiBaru} Sesi.`);
  window.loadAdminDashboard();
};

// ==========================================
// MODAL TAMBAH / EDIT MURID
// ==========================================
window.bukaModalMurid = async function (idMurid = null) {
  const selectParent = document.getElementById('murid-parent-id');
  const { data: parents } = await supabase.from('users').select('id, nama, no_wa, username').eq('role', 'parent');

  selectParent.innerHTML = '<option value="">-- Belum Ditautkan --</option>' +
    (parents || []).map((p) => `<option value="${p.id}">${p.nama} (${p.no_wa || p.username})</option>`).join('');

  if (idMurid) {
    const m = daftarMuridCache.find((item) => item.id_murid === idMurid);
    document.getElementById('judul-modal-murid').innerText = 'Edit Data Murid';
    document.getElementById('murid-edit-id').value = m.id_murid;
    document.getElementById('murid-nama').value = m.nama_murid;
    document.getElementById('murid-panggilan').value = m.nama_panggilan || '';
    document.getElementById('murid-wa').value = m.no_wa || '';
    document.getElementById('murid-program').value = m.program || 'Reguler';
    document.getElementById('murid-sesi').value = m.sisa_sesi ?? 0;
    document.getElementById('murid-expired').value = m.expired_sesi || '';
    selectParent.value = m.parent_user_id || '';
  } else {
    document.getElementById('judul-modal-murid').innerText = 'Tambah Murid Baru';
    document.getElementById('murid-edit-id').value = '';
    document.getElementById('murid-nama').value = '';
    document.getElementById('murid-panggilan').value = '';
    document.getElementById('murid-wa').value = '';
    document.getElementById('murid-program').value = 'Reguler';
    document.getElementById('murid-sesi').value = 4;
    document.getElementById('murid-expired').value = '';
  }

  document.getElementById('modal-murid').classList.remove('hidden');
};

window.simpanDataMurid = async function () {
  const id = document.getElementById('murid-edit-id').value;
  const payload = {
    nama_murid: document.getElementById('murid-nama').value.trim(),
    nama_panggilan: document.getElementById('murid-panggilan').value.trim() || null,
    no_wa: formatWA(document.getElementById('murid-wa').value),
    program: document.getElementById('murid-program').value,
    sisa_sesi: parseInt(document.getElementById('murid-sesi').value) || 0,
    expired_sesi: document.getElementById('murid-expired').value || null,
    parent_user_id: document.getElementById('murid-parent-id').value || null
  };

  const { error } = id
    ? await supabase.from('murid').update(payload).eq('id_murid', id)
    : await supabase.from('murid').insert([payload]);

  if (error) return alert('Gagal menyimpan murid: ' + error.message);

  window.tutupModal('modal-murid');
  window.loadAdminDashboard();
};

// ==========================================
// MODAL BUAT AKUN LOGIN (COACH / WALI / ADMIN)
// ==========================================
window.bukaModalAkun = function () {
  const selectMurid = document.getElementById('akun-murid-id');
  selectMurid.innerHTML = '<option value="">-- Pilih Murid --</option>' +
    daftarMuridCache.map((m) => `<option value="${m.id_murid}">${m.nama_murid}</option>`).join('');
  document.getElementById('modal-akun').classList.remove('hidden');
};

window.togglePilihMuridAkun = function () {
  const role = document.getElementById('akun-role').value;
  document.getElementById('wrap-taut-murid').classList.toggle('hidden', role !== 'parent');
};

window.simpanAkunBaru = async function () {
  const role = document.getElementById('akun-role').value;
  const nama = document.getElementById('akun-nama').value.trim();
  const wa = formatWA(document.getElementById('akun-wa').value);
  const username = document.getElementById('akun-username').value.trim() || null;
  const password = document.getElementById('akun-password').value.trim();
  const idMurid = document.getElementById('akun-murid-id').value;

  if (!wa && !username) return alert('Isi minimal No. HP atau Username untuk login!');

  const { data: newUser, error } = await supabase
    .from('users')
    .insert([{ nama, username, no_wa: wa || null, password, role }])
    .select()
    .single();

  if (error) return alert('Gagal membuat akun: ' + error.message);

  if (role === 'parent' && idMurid && newUser) {
    await supabase.from('murid').update({ parent_user_id: newUser.id }).eq('id_murid', idMurid);
  }

  alert('✅ Akun berhasil dibuat!');
  window.tutupModal('modal-akun');
  window.loadAdminDashboard();
};

// ==========================================
// INFO REKENING PEMBAYARAN
// ==========================================
window.bukaModalRekening = function () {
  document.getElementById('input-info-rekening').value =
    localStorage.getItem('anam_rekening') || 'BCA a.n Anam Swimming Course\nNo. Rek: 1234567890';
  document.getElementById('modal-rekening').classList.remove('hidden');
};

window.simpanInfoRekening = function () {
  localStorage.setItem('anam_rekening', document.getElementById('input-info-rekening').value.trim());
  window.tutupModal('modal-rekening');
  alert('✅ Info rekening tersimpan untuk format tagihan WA.');
};
