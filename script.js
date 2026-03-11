const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const dotLinks = [...document.querySelectorAll('.section-dots a')];
const sections = [...document.querySelectorAll('.panel')];
const revealItems = [...document.querySelectorAll('.reveal')];
const counters = [...document.querySelectorAll('[data-count]')];
const bgVideos = [...document.querySelectorAll('.bg-video')];
const heroVideo = document.querySelector('.hero-video');

const updateHeaderState = () => {
  if (!header) {
    return;
  }
  header.classList.toggle('scrolled', window.scrollY > 24);
};

const getNavHash = (link) => {
  const href = link.getAttribute('href');
  if (!href || !href.includes('#')) {
    return null;
  }
  const parts = href.split('#');
  return parts[parts.length - 1] || null;
};

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const hash = getNavHash(link);
    if (!hash) {
      return;
    }
    const active = hash === id;
    link.classList.toggle('active', active);
  });

  dotLinks.forEach((link) => {
    const active = link.dataset.target === id;
    link.classList.toggle('active', active);
  });
};

const animateCounter = (node) => {
  const target = Number(node.dataset.count);
  if (Number.isNaN(target)) {
    return;
  }

  const start = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - p) ** 3;
    node.textContent = Math.round(target * eased);
    if (p < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if (sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.id;
        setActiveNav(id);

      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.65 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${index % 4 === 0 ? 0 : (index % 4) * 70}ms`;
    revealObserver.observe(item);
  });
}

const closeMenu = () => {
  if (!menuToggle || !nav) {
    return;
  }
  menuToggle.classList.remove('open');
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
};

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1120) {
        closeMenu();
      }
    });
  });
}

bgVideos.forEach((video) => {
  const panel = video.closest('.panel');
  if (!panel) {
    return;
  }

  const useFallback = () => panel.classList.add('video-fallback');
  const useVideo = () => panel.classList.remove('video-fallback');

  video.addEventListener('error', useFallback);
  video.addEventListener('abort', useFallback);
  video.addEventListener('canplay', useVideo);
});

if (heroVideo) {
  const tryPlayHero = () => {
    heroVideo.play().catch(() => {
      // Keep muted autoplay attempt non-blocking.
    });
  };

  heroVideo.addEventListener('loadedmetadata', tryPlayHero);
  window.addEventListener('pointerdown', tryPlayHero, { once: true });
}

window.addEventListener('scroll', updateHeaderState);
window.addEventListener('resize', () => {
  if (window.innerWidth > 1120) {
    closeMenu();
  }
});

updateHeaderState();
setActiveNav(sections[0]?.id || 'hero');
