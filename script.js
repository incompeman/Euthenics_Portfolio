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
  // Theme Toggle (Light / Dark) & Color-Scheme Synchronization
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleText = document.getElementById('theme-toggle-text');
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  const themeColorMeta = document.getElementById('theme-color-meta');

  function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getActiveTheme() {
    return document.documentElement.getAttribute('data-theme') ||
           localStorage.getItem('theme') ||
           getSystemPreference();
  }

  function updateThemeUI(theme) {
    if (!themeToggleBtn) return;
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    
    // Accessibility labels
    themeToggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggleBtn.setAttribute('title', `Current theme: ${theme.toUpperCase()} (Click to switch to ${nextTheme.toUpperCase()})`);
    
    if (themeToggleText) {
      themeToggleText.textContent = isDark ? 'DARK' : 'LIGHT';
    }

    if (themeColorMeta) {
      themeColorMeta.content = isDark ? '#0a0a0c' : '#ffffff';
    }
  }

  function setTheme(newTheme, isUserAction = false) {
    const systemPref = getSystemPreference();

    if (isUserAction) {
      // Per Modern Web Guidance for two-state toggles:
      // If user toggles to match their system preference, remove stored override.
      // If user toggles to differ from system preference, store override.
      if (newTheme === systemPref) {
        localStorage.removeItem('theme');
        if (colorSchemeMeta) colorSchemeMeta.content = 'light dark';
      } else {
        localStorage.setItem('theme', newTheme);
        if (colorSchemeMeta) colorSchemeMeta.content = newTheme;
      }
    } else {
      const stored = localStorage.getItem('theme');
      if (colorSchemeMeta) colorSchemeMeta.content = stored ? stored : 'light dark';
    }

    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeUI(newTheme);
  }

  // Initialize UI based on current rendered state
  updateThemeUI(getActiveTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = getActiveTheme();
      const target = current === 'dark' ? 'light' : 'dark';
      setTheme(target, true);
    });
  }

  // React to OS-level preference changes if user hasn't explicitly overridden
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setTheme(newSystemTheme, false);
    }
  });

  // Cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      const active = e.newValue || getSystemPreference();
      setTheme(active, false);
    }
  });

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
    document.body.classList.add('lightbox-open');

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
    document.body.classList.remove('lightbox-open');
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

  // =========================================================================
  // 6. Custom Minimalist Fluid Cursor
  // =========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  // Activate only for fine pointer devices with hover capability
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasFinePointer && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorVisible = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerpFactor = reducedMotion ? 1 : 0.18;

    function renderCursor() {
      // Smooth linear interpolation for ring follower
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(renderCursor);
    }

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!cursorVisible) {
        ringX = mouseX;
        ringY = mouseY;
        cursorVisible = true;
        cursorDot.classList.add('visible');
        cursorRing.classList.add('visible');
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('visible');
      cursorRing.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.classList.add('visible');
      cursorRing.classList.add('visible');
    });

    document.addEventListener('mousedown', () => {
      cursorDot.classList.add('clicking');
      cursorRing.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
      cursorDot.classList.remove('clicking');
      cursorRing.classList.remove('clicking');
    });

    // Dynamic state delegation on hover
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (!target) return;

      const mediaCard = target.closest('.media-card');
      const interactiveEl = target.closest('a, button, .hyperlink-pill, .theme-toggle-btn, .lightbox-close, .text-link, .skill-item');

      if (mediaCard) {
        cursorRing.classList.add('media-active');
        cursorDot.classList.add('media-active');
      } else if (interactiveEl) {
        cursorRing.classList.add('hover-active');
        cursorDot.classList.add('hover-active');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (!target) return;

      const mediaCard = target.closest('.media-card');
      const interactiveEl = target.closest('a, button, .hyperlink-pill, .theme-toggle-btn, .lightbox-close, .text-link, .skill-item');

      if (mediaCard) {
        cursorRing.classList.remove('media-active');
        cursorDot.classList.remove('media-active');
      }
      if (interactiveEl) {
        cursorRing.classList.remove('hover-active');
        cursorDot.classList.remove('hover-active');
      }
    });
  }
});
