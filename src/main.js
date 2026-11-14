import './style.css';

// Load komponen HTML secara modular
import nonmemberHtml from './components/nonmember.html?raw';
import adminHtml from './components/admin.html?raw';
import coachHtml from './components/coach.html?raw';
import parentHtml from './components/parent.html?raw';
import modalHtml from './components/modal.html?raw';

// Suntikkan ke container
document.getElementById('nonmember-container').innerHTML = nonmemberHtml;
document.getElementById('admin-container').innerHTML = adminHtml;
document.getElementById('coach-container').innerHTML = coachHtml;
document.getElementById('parent-container').innerHTML = parentHtml;
document.getElementById('modal-container').innerHTML = modalHtml;

// Inisialisasi logika modul
import './js/config.js';
import './js/helper.js';
import './js/login.js';
import './js/admin.js';
import './js/coach.js';
import './js/parent.js';
