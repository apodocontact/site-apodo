(function () {
  const button = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (button && menu) {
    const buttonLabel = button.querySelector('.sr-only');
    const close = () => {
      button.setAttribute('aria-expanded', 'false');
      if (buttonLabel) buttonLabel.textContent = 'Ouvrir le menu';
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      if (buttonLabel) buttonLabel.textContent = open ? 'Ouvrir le menu' : 'Fermer le menu';
      menu.classList.toggle('open', !open);
      document.body.classList.toggle('menu-open', !open);
      if (!open) {
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        close();
        button.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) close();
    });
  }

  document.querySelectorAll('.menu a.active').forEach((link) => {
    link.setAttribute('aria-current', 'page');
  });

  const widget = document.getElementById('haWidget');
  if (widget) {
    window.addEventListener('message', (event) => {
      const allowed = new Set(['https://www.helloasso.com', 'https://helloasso.com']);
      if (!allowed.has(event.origin)) return;
      const value = Number(event.data && event.data.height);
      if (!Number.isFinite(value) || value < 500 || value > 5000) return;
      widget.style.height = `${Math.ceil(value)}px`;
    });
  }
})();
