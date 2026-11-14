import './style.css';

import nonmemberHtml from './components/nonmember.html?raw';
import adminHtml from './components/admin.html?raw';
import coachHtml from './components/coach.html?raw';
import parentHtml from './components/parent.html?raw';
import modalHtml from './components/modal.html?raw';

const containers = {
  'nonmember-container': nonmemberHtml,
  'admin-container': adminHtml,
  'coach-container': coachHtml,
  'parent-container': parentHtml,
  'modal-container': modalHtml,
};

Object.entries(containers).forEach(([id, html]) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
});

import './js/config.js';
import './js/helper.js';
import './js/admin.js';
import './js/coach.js';
import './js/parent.js';
import './js/login.js';
