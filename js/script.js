/* ============================================================
   1) MENU MOBILE (HAMBURGER UNTUK SIDEBAR)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     2) SCROLL-SPY — MENANDAI MENU AKTIF SESUAI SECTION
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => spyObserver.observe(sec));
  }

  /* ============================================================
     3) REVEAL ON SCROLL
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     4) TAHUN FOOTER OTOMATIS
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     5) PERINGATAN JIKA TOMBOL "UNDUH CV" BELUM DIISI FILE ASLI
     ============================================================ */
  const cvBtn = document.getElementById('downloadCvBtn');
  if (cvBtn) {
    cvBtn.addEventListener('click', (e) => {
      if (cvBtn.getAttribute('href') === '#') {
        e.preventDefault();
        alert('Tombol ini siap dipakai — tinggal ganti atribut href pada #downloadCvBtn di index.html dengan path file CV (PDF) kamu.');
      }
    });
  }

  /* ============================================================
     6) GALERI SLIDE PER PROJECT (project-frame[data-gallery])
     ============================================================ */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg    = document.getElementById('lightboxImg');
  const lightboxClose  = document.getElementById('lightboxClose');
  const lightboxPrev   = document.getElementById('lightboxPrev');
  const lightboxNext   = document.getElementById('lightboxNext');

  let activeSlideList = [];
  let activeSlideIndex = 0;

  function openLightbox(images, startIndex) {
    activeSlideList  = images;
    activeSlideIndex = startIndex;
    updateLightboxImg();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  function updateLightboxImg() {
    const img = activeSlideList[activeSlideIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
  }
  function lightboxGo(step) {
    if (!activeSlideList.length) return;
    activeSlideIndex = (activeSlideIndex + step + activeSlideList.length) % activeSlideList.length;
    updateLightboxImg();
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => lightboxGo(-1));
    lightboxNext.addEventListener('click', () => lightboxGo(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxGo(-1);
      if (e.key === 'ArrowRight') lightboxGo(1);
    });
  }

  document.querySelectorAll('.project-frame[data-gallery]').forEach((frame) => {
    const track    = frame.querySelector('.gallery-track');
    const slides   = frame.querySelectorAll('.gallery-slide');
    const prevBtn  = frame.querySelector('.gallery-nav.prev');
    const nextBtn  = frame.querySelector('.gallery-nav.next');
    const dotsWrap = frame.querySelector('.gallery-dots');
    const images   = Array.from(slides).map(s => s.querySelector('img'));
    let index = 0;

    images.forEach((img, i) => {
      if (!img) return;
      img.addEventListener('click', () => openLightbox(images, i));
    });

    if (slides.length <= 1) return;

    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';

    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('span');

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[index].classList.add('active');
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    if ('IntersectionObserver' in window) {
      const peekObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            track.classList.add('peek-hint');
            obs.unobserve(frame);
          }
        });
      }, { threshold: 0.45 });
      peekObserver.observe(frame);
    } else {
      track.classList.add('peek-hint');
    }
  });

  /* ============================================================
     7) SERTIFIKASI — klik gambar buka lightbox, navigasi antar
        semua sertifikat di section ini
     ============================================================ */
  const certImages = Array.from(document.querySelectorAll('#certificates .cert-thumb img'));
  certImages.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(certImages, i));
  });
});
