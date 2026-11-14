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

export function formatTanggalIndo(tgl) {
  if (!tgl) return '-';
  return tgl.split('-').reverse().join('/');
}

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
