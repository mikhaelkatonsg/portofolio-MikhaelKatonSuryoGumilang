/* ============================================================
   PORTFOLIO — MAIN SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     1) MOBILE NAVIGATION
     ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    const closeMenu = () => {
      primaryNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ============================================================
     2) SCROLL SPY
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => spyObserver.observe(section));
  }

  /* ============================================================
     3) REVEAL ON SCROLL
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ============================================================
     4) FOOTER YEAR
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     5) CV GUARD
     ============================================================ */
  const cvBtn = document.getElementById('downloadCvBtn');

  if (cvBtn) {
    cvBtn.addEventListener('click', (event) => {
      if (cvBtn.getAttribute('href') !== '#') return;

      event.preventDefault();
      alert('Ganti href pada #downloadCvBtn dengan path file CV PDF.');
    });
  }

  /* ============================================================
     6) LIGHTBOX
     ============================================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let activeImages = [];
  let activeImageIndex = 0;
  let lastFocusedElement = null;

  function updateLightboxControls() {
    const hasMultiple = activeImages.length > 1;

    if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
    if (lightboxNext) lightboxNext.hidden = !hasMultiple;
  }

  function updateLightboxImage() {
    if (!lightboxImg || !activeImages.length) return;

    const sourceImage = activeImages[activeImageIndex];
    lightboxImg.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImg.alt = sourceImage.alt || 'Pratinjau gambar';
  }

  function openLightbox(images, startIndex = 0) {
    if (!lightbox || !lightboxImg || !images.length) return;

    activeImages = images.filter(Boolean);
    if (!activeImages.length) return;

    activeImageIndex = Math.min(
      Math.max(Number(startIndex) || 0, 0),
      activeImages.length - 1
    );

    lastFocusedElement = document.activeElement;

    updateLightboxImage();
    updateLightboxControls();

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    window.requestAnimationFrame(() => {
      lightboxClose?.focus();
    });
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('open')) return;

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function lightboxGo(step) {
    if (activeImages.length <= 1) return;

    activeImageIndex =
      (activeImageIndex + step + activeImages.length) % activeImages.length;

    updateLightboxImage();
  }

  if (lightbox) {
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', () => lightboxGo(-1));
    lightboxNext?.addEventListener('click', () => lightboxGo(1));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        lightboxGo(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        lightboxGo(1);
      }
    });
  }

  /* ============================================================
     7) SHARED GALLERY / CAROUSEL ENGINE

     Dipakai oleh:
     - Experience
     - Projects

     Treatment gambar:
     - Preview: frame tetap + object-fit: cover
     - Fullscreen: lightbox + object-fit: contain
     ============================================================ */
  document.querySelectorAll('[data-gallery]').forEach((frame) => {
    
    const track = frame.querySelector('.gallery-track');
    const slides = Array.from(frame.querySelectorAll('.gallery-slide'));
    const prevBtn = frame.querySelector('.gallery-nav.prev');
    const nextBtn = frame.querySelector('.gallery-nav.next');
    const dotsWrap = frame.querySelector('.gallery-dots');

    if (!track || !slides.length) return;

    const images = slides
      .map((slide) => slide.querySelector('img'))
      .filter(Boolean);

    images.forEach((img) => img.classList.add('zoomable-image'));

    let zoomHint = frame.querySelector('.media-zoom-hint');

    if (!zoomHint) {
      zoomHint = document.createElement('button');
      zoomHint.type = 'button';
      zoomHint.className = 'media-zoom-hint';
      zoomHint.setAttribute('aria-label', 'Buka gambar ukuran penuh');
      zoomHint.setAttribute('title', 'Perbesar gambar');
      zoomHint.innerHTML = '<i class="fas fa-magnifying-glass-plus" aria-hidden="true"></i>';
      frame.appendChild(zoomHint);
    }

    let index = 0;

    zoomHint.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLightbox(images, index);
    });
    let isDragging = false;
    let dragStartX = 0;
    let dragDistance = 0;
    let suppressImageClick = false;
    let suppressTimer = null;

    frame.setAttribute('role', 'region');
    frame.setAttribute('aria-roledescription', 'carousel');

    if (!frame.hasAttribute('tabindex')) {
      frame.tabIndex = 0;
    }

    function getDragThreshold() {
      return Math.max(45, Math.min(90, frame.clientWidth * 0.12));
    }

    function updateDots() {
      if (!dotsWrap) return;

      dotsWrap.querySelectorAll('.gallery-dot').forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('active', isActive);

        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function goTo(newIndex, animate = true) {
      index = (newIndex + slides.length) % slides.length;
      track.style.transition = animate ? 'transform 0.45s ease' : 'none';
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    }

    function markImageError(img) {
      const slide = img.closest('.gallery-slide');
      if (!slide) return;

      slide.classList.add('image-load-error');
      img.setAttribute('aria-hidden', 'true');
    }

    images.forEach((img, imageIndex) => {
      img.draggable = false;
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `${img.alt || 'Gambar'} — buka ukuran penuh`);

      if (img.complete && img.naturalWidth === 0) {
        markImageError(img);
      }

      img.addEventListener('error', () => markImageError(img));
      img.addEventListener('dragstart', (event) => event.preventDefault());

      img.addEventListener('click', (event) => {
        if (suppressImageClick) {
          event.preventDefault();
          event.stopPropagation();
          suppressImageClick = false;
          return;
        }

        if (img.closest('.gallery-slide')?.classList.contains('image-load-error')) {
          return;
        }

        openLightbox(images, imageIndex);
      });

      img.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();

        if (img.closest('.gallery-slide')?.classList.contains('image-load-error')) {
          return;
        }

        openLightbox(images, imageIndex);
      });
    });

    /*
     * Fallback event delegation. Jika browser menargetkan slide alih-alih img,
     * klik pada area slide aktif tetap membuka gambar penuh.
     */
    frame.addEventListener('click', (event) => {
      if (event.defaultPrevented || suppressImageClick) return;
      if (event.target.closest('.gallery-nav, .gallery-dots, .media-zoom-hint')) return;

      const directImage = event.target.closest('.gallery-slide img');
      if (directImage) return; // sudah ditangani handler img di atas

      const clickedSlide = event.target.closest('.gallery-slide');
      if (!clickedSlide || clickedSlide.classList.contains('image-load-error')) return;

      const clickedIndex = slides.indexOf(clickedSlide);
      if (clickedIndex < 0 || !images[clickedIndex]) return;

      openLightbox(images, clickedIndex);
    });

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      dotsWrap.setAttribute('role', 'group');

      slides.forEach((_, dotIndex) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot';
        dot.setAttribute(
          'aria-label',
          `Tampilkan gambar ${dotIndex + 1} dari ${slides.length}`
        );

        dot.addEventListener('click', (event) => {
          event.stopPropagation();
          goTo(dotIndex);
        });

        dotsWrap.appendChild(dot);
      });
    }

    const hasMultipleSlides = slides.length > 1;

    if (prevBtn) prevBtn.hidden = !hasMultipleSlides;
    if (nextBtn) nextBtn.hidden = !hasMultipleSlides;
    if (dotsWrap) dotsWrap.hidden = !hasMultipleSlides;

    if (hasMultipleSlides) {
      prevBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        goTo(index - 1);
      });

      nextBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        goTo(index + 1);
      });

      let capturedPointerId = null;

      let pointerIsDown = false;
      let dragActivated = false;

      frame.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary) return;
        if (event.target.closest('.gallery-nav, .gallery-dots, .media-zoom-hint')) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        clearTimeout(suppressTimer);

        pointerIsDown = true;
        isDragging = true;
        dragActivated = false;
        dragStartX = event.clientX;
        dragDistance = 0;
        suppressImageClick = false;
        capturedPointerId = null;

        /*
         * Jangan aktifkan class is-dragging saat pointer baru ditekan.
         * CSS untuk class itu menonaktifkan pointer-events pada img. Jika class
         * aktif terlalu cepat, browser kehilangan target img sebelum event click.
         * Class baru dipasang setelah gerakan benar-benar menjadi drag.
         */
      });

      frame.addEventListener('pointermove', (event) => {
        if (!pointerIsDown || !isDragging) return;

        dragDistance = event.clientX - dragStartX;

        if (Math.abs(dragDistance) > 8) {
          suppressImageClick = true;

          if (!dragActivated) {
            dragActivated = true;
            frame.classList.add('is-dragging');
            track.style.transition = 'none';
          }

          if (capturedPointerId === null && frame.setPointerCapture) {
            try {
              frame.setPointerCapture(event.pointerId);
              capturedPointerId = event.pointerId;
            } catch (_) {
              // Fallback aman untuk browser yang membatasi pointer capture.
            }
          }

          track.style.transform =
            `translateX(calc(-${index * 100}% + ${dragDistance}px))`;
        }
      });

      function finishDrag(cancelled = false) {
        if (!isDragging) return;

        pointerIsDown = false;
        isDragging = false;
        frame.classList.remove('is-dragging');

        const threshold = getDragThreshold();

        /* Klik biasa tidak perlu mengubah posisi atau state carousel. */
        if (dragActivated) {
          if (cancelled) {
            goTo(index);
          } else if (dragDistance <= -threshold) {
            goTo(index + 1);
          } else if (dragDistance >= threshold) {
            goTo(index - 1);
          } else {
            goTo(index);
          }
        }

        dragDistance = 0;
        dragActivated = false;
        capturedPointerId = null;

        if (suppressImageClick) {
          suppressTimer = window.setTimeout(() => {
            suppressImageClick = false;
          }, 300);
        }
      }

      frame.addEventListener('pointerup', () => finishDrag(false));
      frame.addEventListener('pointercancel', () => finishDrag(true));
      frame.addEventListener('lostpointercapture', () => {
        if (isDragging) finishDrag(false);
      });

      frame.addEventListener('keydown', (event) => {
        if (lightbox?.classList.contains('open')) return;
        if (event.target.closest('.gallery-dot, .media-zoom-hint')) return;

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(index - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(index + 1);
        }
      });
    }

    /* Peek hint hanya untuk kartu Project. */
    if (
      hasMultipleSlides &&
      frame.classList.contains('project-frame') &&
      'IntersectionObserver' in window
    ) {
      const peekObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const reducedMotion = window.matchMedia(
              '(prefers-reduced-motion: reduce)'
            ).matches;

            if (!reducedMotion) {
              track.classList.add('peek-hint');
              track.addEventListener(
                'animationend',
                () => track.classList.remove('peek-hint'),
                { once: true }
              );
            }

            observer.unobserve(frame);
          });
        },
        { threshold: 0.45 }
      );

      peekObserver.observe(frame);
    }

    goTo(0, false);
  });

  /* ============================================================
     8) CERTIFICATE LIGHTBOX
     ============================================================ */
  const certImages = Array.from(
    document.querySelectorAll('#certificates .cert-thumb img')
  );

  certImages.forEach((img, index) => {
    img.classList.add('zoomable-image');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || 'Sertifikat'} — buka ukuran penuh`);

    img.addEventListener('click', () => openLightbox(certImages, index));
    img.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openLightbox(certImages, index);
    });
  });

  /* ============================================================
     9) ALL OTHER SITE IMAGES -> LIGHTBOX
     Gambar yang bukan bagian carousel/sertifikat tetap dapat diklik,
     sehingga seluruh gambar utama di website memiliki perilaku konsisten.
     ============================================================ */
  const standaloneImages = Array.from(document.querySelectorAll('main img')).filter(
    (img) => !img.closest('[data-gallery]') && !img.closest('#certificates')
  );

  standaloneImages.forEach((img) => {
    img.classList.add('zoomable-image');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || 'Gambar'} — buka ukuran penuh`);

    img.addEventListener('click', () => openLightbox([img], 0));
    img.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openLightbox([img], 0);
    });
  });
});
