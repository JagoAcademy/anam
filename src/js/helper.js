import { CLUB_INFO } from './config.js';

const ALL_PAGES = [
  'page-login',
  'page-nonmember',
  'page-admin',
  'page-coach',
  'page-parent'
];

// Navigasi antar halaman SPA
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

// Redirect WhatsApp Admin
window.chatAdmin = function (pesan = 'Halo Admin Anam Swimming Course, saya ingin tanya info kursus renang.') {
  const url = `https://wa.me/${CLUB_INFO.waAdmin}?text=${encodeURIComponent(pesan)}`;
  window.open(url, '_blank');
};

// Helper format Rupiah
export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0);
}
