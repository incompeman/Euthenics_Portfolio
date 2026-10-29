/**
 * JERIC JOBLI — MONOCHROME SCROLL PORTFOLIO SCRIPT
 * Functionality:
 * 1. Scroll Progress Bar tracking
 * 2. IntersectionObserver for subtle editorial scroll reveal animations
 * 3. Silent hover video previews in the scroll stream
 * 4. Fullscreen dark enlarged lightbox for pictures and videos with X exit button
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // =========================================================================
  // 2. Scroll Progress Bar
  // =========================================================================
  const progressBar = document.getElementById('scroll-progress');
  let ticking = false;

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive: true });

  updateScrollProgress();

  // =========================================================================
  // 3. Subtle Editorial Scroll Reveal Animations
  // =========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // =========================================================================
  // 4. Silent Video Preview on Hover in Stream
  // =========================================================================
  const videoCards = document.querySelectorAll('.media-card[data-type="video"]');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.muted = true;
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // =========================================================================
  // 5. Dark Fullscreen Lightbox for Pictures & Videos
  // =========================================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxViewport = document.getElementById('lightbox-viewport');

  function openLightbox(type, src, caption) {
    if (!lightbox || !lightboxContent) return;

    // Clear previous media
    lightboxContent.innerHTML = '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';

    if (type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.src = src;
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.style.width = '100%';
      videoEl.style.maxHeight = 'calc(88vh - 40px)';
      videoEl.style.backgroundColor = '#000000';
      lightboxContent.appendChild(videoEl);
    } else {
      const imgEl = document.createElement('img');
      imgEl.src = src;
      imgEl.alt = caption || 'Enlarged project media';
      imgEl.style.maxHeight = 'calc(88vh - 40px)';
      lightboxContent.appendChild(imgEl);
    }

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;

    // Stop and clear any playing video
    const activeVideo = lightboxContent ? lightboxContent.querySelector('video') : null;
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.src = '';
    }

    if (lightboxContent) lightboxContent.innerHTML = '';
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Bind click event to all media cards
  const mediaCards = document.querySelectorAll('.media-card');
  mediaCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type || 'image';
      const src = card.dataset.src;
      const caption = card.dataset.caption || '';
      if (src) {
        openLightbox(type, src, caption);
      }
    });
  });

  // Close on X button click
  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Close on backdrop click (outside media content)
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxViewport) {
        closeLightbox();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});
