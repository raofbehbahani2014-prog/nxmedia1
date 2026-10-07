document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('nav.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const newsletterForm = document.querySelector('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[name="email"]').value;
      const msgBox = newsletterForm.querySelector('.form-msg');
      try {
        const res = await fetch('/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (msgBox) msgBox.textContent = data.message || 'عضویت با موفقیت انجام شد.';
        newsletterForm.reset();
      } catch (err) {
        if (msgBox) msgBox.textContent = 'خطایی رخ داد. دوباره تلاش کنید.';
      }
    });
  }

  const searchForm = document.querySelector('#site-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      const input = searchForm.querySelector('input[name="q"]');
      if (!input.value.trim()) e.preventDefault();
    });
  }
});
