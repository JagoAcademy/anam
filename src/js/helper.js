import { CLUB_INFO } from './config.js';

const ALL_PAGES = [
  'page-login',
  'page-nonmember',
  'page-admin',
  'page-coach',
  'page-parent'
];

window.pindahHalaman = function (targetId) {
  ALL_PAGES.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === targetId) {
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
      } else {
        el.classList.add('hidden');
      }
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export function formatWA(nomor) {
  let clean = (nomor || '').replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  return clean;
}

export function formatRupiah(angka) {
  return 'Rp ' + (parseInt(angka) || 0).toLocaleString('id-ID');
}

export function getTodayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTanggalIndo(tgl) {
  if (!tgl) return '-';
  return tgl.split('-').reverse().join('/');
}

export function formatHariTanggalLengkap(tgl) {
  if (!tgl) return '-';
  const parts = tgl.split('-');
  if (parts.length !== 3) return tgl;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

window.kirimLogAssesmentWA = function ({ namaMurid, noWa, tanggal, namaCoach, materi, sisaSesi }) {
  const waTujuan = formatWA(noWa);
  if (!waTujuan) {
    return alert(`Nomor WhatsApp wali murid untuk ${namaMurid} belum diisi!`);
  }

  const hariTanggal = formatHariTanggalLengkap(tanggal);
  const infoSisa = sisaSesi !== undefined && sisaSesi !== null ? `\n📊 *Sisa Sesi:* ${sisaSesi} Sesi` : '';

  const pesan =
`*LAPORAN LATIHAN — ANAM SWIMMING COURSE* 🏊‍♂️

👤 *Murid:* ${namaMurid}
📅 *${hariTanggal}*
👨‍🏫 *Nama Coach:* ${namaCoach || '-'}
📝 *Latihan hari ini :*
${materi || '-'}${infoSisa}

Terima kasih Ayah/Bunda! 🙏`;

  window.open(`https://wa.me/${waTujuan}?text=${encodeURIComponent(pesan)}`, '_blank');
};

window.chatAdmin = function (pesan = 'Halo Admin Anam Swimming Course, saya ingin tanya info kursus renang.') {
  window.open(`https://wa.me/${CLUB_INFO.waAdmin}?text=${encodeURIComponent(pesan)}`, '_blank');
};

window.kirimPendaftaranWA = function () {
  const nama = document.getElementById('reg-nama').value.trim();
  const usia = document.getElementById('reg-usia').value.trim();
  const program = document.getElementById('reg-program').value;
  const wa = document.getElementById('reg-wa').value.trim();

  const teks = `Halo Admin Anam Swimming Course, saya ingin mendaftarkan siswa baru:\n- Nama: ${nama}\n- Usia: ${usia} th\n- Program: ${program}\n- No WA: ${wa}`;
  window.chatAdmin(teks);
};
