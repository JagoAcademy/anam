import './style.css';

import nonmemberHtml from './components/nonmember.html?raw';
import adminHtml from './components/admin.html?raw';
import coachHtml from './components/coach.html?raw';
import parentHtml from './components/parent.html?raw';
import modalHtml from './components/modal.html?raw';

document.getElementById('nonmember-container').innerHTML = nonmemberHtml;
document.getElementById('admin-container').innerHTML = adminHtml;
document.getElementById('coach-container').innerHTML = coachHtml;
document.getElementById('parent-container').innerHTML = parentHtml;
document.getElementById('modal-container').innerHTML = modalHtml;

import './js/config.js';
import './js/helper.js';
import './js/admin.js';
import './js/coach.js';
import './js/parent.js';
import './js/login.js';
