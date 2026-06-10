/* ===================================================
   Laju — script.js
   Interaksi KHUSUS halaman utama (index.html).
   Bagian umum (menu, dark mode, chat, dll) ada di app.js
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Video latar hero: putar 2 video bergantian (loop) ---------- */
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const clips = ['bg-video-1.mp4', 'bg-video-2.mp4']; // ganti dengan video Anda
    let ci = 0;
    const playClip = (i) => { heroVideo.src = clips[i]; heroVideo.load(); heroVideo.play().catch(() => {}); };
    heroVideo.addEventListener('ended', () => {
      if (heroVideo.currentTime < 1) return; // abaikan 'ended' palsu di awal
      ci = (ci + 1) % clips.length; playClip(ci);
    });
    playClip(0);
  }

  /* ---------- Cek domain (simulasi realistis multi-TLD) ---------- */
  const domainForm = document.getElementById('domainForm');
  const domainInput = document.getElementById('domainInput');
  const domainResult = document.getElementById('domainResult');

  // TLD + harga (selaras tabel domain di #domain & katalog file 02)
  const DOMAIN_TLDS = [
    { ext: '.id', price: 199000 },
    { ext: '.com', price: 159000 },
    { ext: '.my.id', price: 25000 },
    { ext: '.store', price: 39000 },
    { ext: '.online', price: 39000 },
  ];
  const rpFmt = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
  // Hash sederhana → ketersediaan deterministik (nama sama = hasil sama)
  const domHash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  if (domainForm) {
    domainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let raw = domainInput.value.trim().toLowerCase();
      domainResult.className = 'domain-result';

      if (!raw) {
        domainResult.textContent = 'Silakan ketik nama domain dulu ya.';
        domainResult.classList.add('no');
        return;
      }
      // Ambil "base" nama saja (buang protokol, path, dan ekstensi yang diketik)
      let base = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\s+/g, '').split('.')[0];
      base = base.replace(/[^a-z0-9-]/g, '');
      if (base.length < 2) {
        domainResult.innerHTML = '😕 Nama domain terlalu pendek. Coba minimal 2 huruf.';
        domainResult.classList.add('no');
        return;
      }

      const rows = DOMAIN_TLDS.map((t) => {
        const dom = base + t.ext;
        const available = (domHash(dom) % 10) < 6; // ~60% tersedia, deterministik
        if (available) {
          return `<div class="dom-row dom-yes">
            <span class="dom-name">${dom}</span>
            <span class="dom-status">✓ Tersedia</span>
            <span class="dom-price">${rpFmt(t.price)}/th</span>
            <a class="btn btn-primary btn-sm" href="checkout.html?plan=bisnis&domain=${encodeURIComponent(dom)}">Pesan</a>
          </div>`;
        }
        return `<div class="dom-row dom-no">
          <span class="dom-name">${dom}</span>
          <span class="dom-status">✕ Sudah dipakai</span>
        </div>`;
      }).join('');

      domainResult.innerHTML = `<p class="dom-head">Hasil untuk "<strong>${base}</strong>":</p><div class="dom-results">${rows}</div>`;
    });
  }

  /* ---------- Toggle harga Bulanan / Tahunan ---------- */
  const billingSwitch = document.getElementById('billingSwitch');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');
  const amounts = document.querySelectorAll('.amount');
  const formatRp = (n) => Number(n).toLocaleString('id-ID');

  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      const yearly = billingSwitch.getAttribute('aria-checked') !== 'true';
      billingSwitch.setAttribute('aria-checked', yearly);
      labelMonthly.classList.toggle('active', !yearly);
      labelYearly.classList.toggle('active', yearly);
      amounts.forEach(el => {
        el.textContent = formatRp(yearly ? el.dataset.yearly : el.dataset.monthly);
      });
    });
  }

  /* ---------- Akordion FAQ ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(it => {
        it.classList.remove('open');
        it.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Form kontak (simulasi) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk) {
        formMsg.textContent = '⚠️ Mohon isi nama dan email yang valid.';
        formMsg.style.color = '#fde047';
        return;
      }
      formMsg.textContent = `✅ Terima kasih, ${name}! Tim kami akan menghubungi Anda di ${email}.`;
      formMsg.style.color = '#fff';
      contactForm.reset();
      if (window.NH) window.NH.toast('Pesan terkirim! Kami akan menghubungi Anda. 📨');
    });
  }
});
