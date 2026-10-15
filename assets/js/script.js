'use strict';

const toggle = (el) => el.classList.toggle('active');

/* ---------- sidebar (mobile "show contacts") ---------- */
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');
sidebarBtn.addEventListener('click', () => toggle(sidebar));

/* ---------- testimonials modal ---------- */
const testimonialsItems = document.querySelectorAll('[data-testimonials-item]');
const modalContainer = document.querySelector('[data-modal-container]');
const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
const overlay = document.querySelector('[data-overlay]');
const modalImg = document.querySelector('[data-modal-img]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalText = document.querySelector('[data-modal-text]');

const toggleModal = () => {
  toggle(modalContainer);
  toggle(overlay);
};

testimonialsItems.forEach((item) => {
  item.addEventListener('click', () => {
    modalImg.textContent = item.querySelector('[data-testimonials-avatar]').textContent;
    modalTitle.textContent = item.querySelector('[data-testimonials-title]').textContent;
    modalText.innerHTML = item.querySelector('[data-testimonials-text]').innerHTML;
    toggleModal();
  });
});
modalCloseBtn.addEventListener('click', toggleModal);
overlay.addEventListener('click', toggleModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalContainer.classList.contains('active')) toggleModal();
});

/* ---------- portfolio filter ---------- */
const select = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-selecct-value]');
const filterBtns = document.querySelectorAll('[data-filter-btn]');
const filterItems = document.querySelectorAll('[data-filter-item]');

select.addEventListener('click', () => toggle(select));

const filterFunc = (value) => {
  filterItems.forEach((item) => {
    const show = value === 'all' || value === item.dataset.category;
    item.classList.toggle('active', show);
  });
};

selectItems.forEach((item) => {
  item.addEventListener('click', () => {
    const value = item.innerText.toLowerCase();
    selectValue.innerText = item.innerText;
    toggle(select);
    filterFunc(value);
  });
});

let lastClickedBtn = filterBtns[0];
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectValue.innerText = btn.innerText;
    filterFunc(btn.innerText.toLowerCase());
    lastClickedBtn.classList.remove('active');
    btn.classList.add('active');
    lastClickedBtn = btn;
  });
});

/* ---------- contact form ---------- */
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

formInputs.forEach((input) => {
  input.addEventListener('input', () => {
    formBtn.disabled = !form.checkValidity();
  });
});

// Static hosting (GitHub Pages) has no backend, so open the visitor's mail client.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`Portfolio contact from ${data.get('fullname')}`);
  const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('fullname')} (${data.get('email')})`);
  window.location.href = `mailto:jahidorjahid@gmail.com?subject=${subject}&body=${body}`;
});

/* ---------- page navigation ---------- */
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

const showPage = (name) => {
  let found = false;
  pages.forEach((page) => {
    const match = page.dataset.page === name;
    page.classList.toggle('active', match);
    found = found || match;
  });
  navigationLinks.forEach((link) => {
    link.classList.toggle('active', link.textContent.toLowerCase() === name);
  });
  return found;
};

navigationLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const name = link.textContent.toLowerCase();
    showPage(name);
    history.replaceState(null, '', `#${name}`);
    window.scrollTo(0, 0);
  });
});

// open the tab named in the URL hash, e.g. /#portfolio
const initial = location.hash.slice(1).toLowerCase();
if (initial) showPage(initial) || showPage('about');

/* ---------- footer year ---------- */
document.querySelector('[data-year]').textContent = new Date().getFullYear();
