const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const mobile = matchMedia('(max-width: 900px)');
const themeButton = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');

function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeMeta.content = dark ? '#101012' : '#f8fafc';
}
themeButton.hidden = false;
syncTheme();
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('portfolio-theme', next); } catch {}
  syncTheme();
});
window.addEventListener('storage', event => {
  if (event.key === 'portfolio-theme' && ['dark', 'light'].includes(event.newValue)) {
    document.documentElement.dataset.theme = event.newValue;
    syncTheme();
  }
});

menuButton.hidden = false;
document.documentElement.classList.add('nav-enhanced');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.firstChild.textContent = 'Menu ';
  menuButton.querySelector('span').textContent = '+';
  navigation.classList.remove('is-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.firstChild.textContent = expanded ? 'Close ' : 'Menu ';
  menuButton.querySelector('span').textContent = expanded ? '−' : '+';
  navigation.classList.toggle('is-open', expanded);
});
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
mobile.addEventListener('change', () => closeMenu(mobile.matches && navigation.contains(document.activeElement)));

for (const bar of document.querySelectorAll('[data-filter]')) {
  bar.hidden = false;
  const publications = bar.dataset.filter === 'publications';
  const items = [...document.querySelectorAll(publications ? '.publication' : '.project-card')];
  const count = document.querySelector(publications ? '#publication-count' : '#project-count');
  bar.addEventListener('click', event => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    for (const sibling of bar.querySelectorAll('button')) {
      sibling.classList.toggle('active', sibling === button);
      sibling.setAttribute('aria-pressed', String(sibling === button));
    }
    let visible = 0;
    for (const item of items) {
      const selected = button.dataset.value;
      const matches = selected === 'all' || (selected === 'featured' ? item.dataset.featured === 'true' : item.dataset.category === selected);
      item.hidden = !matches;
      if (!item.hidden) visible++;
    }
    count.textContent = `${visible} ${publications ? 'papers' : 'projects'} shown`;
  });
  // Lead with a concise selection; the full catalog remains one filter away.
  if (!publications) bar.querySelector('[data-value="featured"]').click();
}

if ('IntersectionObserver' in window) {
  const sections = document.querySelectorAll('main section[id]');
  const links = [...navigation.querySelectorAll('a')];
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    const current = [...visible].sort((a, b) => Math.abs(a.getBoundingClientRect().top - 90) - Math.abs(b.getBoundingClientRect().top - 90))[0];
    links.forEach(link => {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-80px 0px -45% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

const copyButton = document.querySelector('.copy-email');
if (navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('uddeshay.oj@gmail.com');
      document.querySelector('#copy-status').textContent = 'Email address copied.';
    } catch {
      document.querySelector('#copy-status').textContent = 'Please select and copy the email address above.';
    }
  });
}
const contactForm = document.querySelector('#contact-form');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();
  const message = contactForm.elements.body.value.trim();
  const subject = `Portfolio enquiry from ${name}`;
  const body = `${message}\n\nFrom: ${name}\nReply to: ${email}`;
  document.querySelector('#form-status').textContent = 'Opening your email app. If no draft appears, use the email link on the left.';
  window.location.href = `mailto:uddeshay.oj@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
