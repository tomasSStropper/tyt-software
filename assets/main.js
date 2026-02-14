(() => {
  const storageKey = "tyt-lang";
  const html = document.documentElement;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const motionState = {
    reduced: reducedMotionQuery.matches,
    particles: null,
  };

  const allTranslatables = () =>
    document.querySelectorAll("[data-es], [data-en], [data-es-html], [data-en-html]");

  const setLanguage = (lang) => {
    allTranslatables().forEach((el) => {
      const htmlKey = lang === "es" ? "esHtml" : "enHtml";
      const textKey = lang === "es" ? "es" : "en";

      if (el.dataset[htmlKey]) {
        el.innerHTML = el.dataset[htmlKey];
      } else if (el.dataset[textKey]) {
        el.textContent = el.dataset[textKey];
      }
    });

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.langBtn === lang));
    });

    html.lang = lang;
    localStorage.setItem(storageKey, lang);
  };

  const initLanguage = () => {
    const saved = localStorage.getItem(storageKey);
    setLanguage(saved === "en" ? "en" : "es");

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.dataset.langBtn));
      btn.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          setLanguage(event.key === "ArrowLeft" ? "es" : "en");
        }
      });
    });
  };

  const initMobileMenu = () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector(".nav-links");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  };

  const initNavbarMotion = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const setHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 14);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  };

  const initReveal = () => {
    const revealItems = [...document.querySelectorAll(".reveal")];
    revealItems.forEach((el, index) => {
      const inGrid = el.closest(".grid-2, .grid-3, .timeline, .metric-grid");
      const delay = inGrid ? (index % 4) * 65 : 0;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((el) => observer.observe(el));
  };

  const initCardGlow = () => {
    document.querySelectorAll(".card, .hero-panel, .hero-card, .cta-band").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    });
  };

  const initScrollIndicator = () => {
    const indicator = document.querySelector("[data-scroll-indicator]");
    if (!indicator) return;

    indicator.addEventListener("click", () => {
      const target = document.querySelector(".section");
      target?.scrollIntoView({ behavior: motionState.reduced ? "auto" : "smooth", block: "start" });
    });
  };

  const initMailtoForm = () => {
    const form = document.querySelector("[data-mailto-form]");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(`Nuevo contacto TyT - ${data.get("empresa") || "Empresa"}`);
      const body = encodeURIComponent(
        `Nombre: ${data.get("nombre") || ""}\n` +
          `Empresa: ${data.get("empresa") || ""}\n` +
          `Email: ${data.get("email") || ""}\n` +
          `Servicio: ${data.get("servicio") || ""}\n\n` +
          `Mensaje:\n${data.get("mensaje") || ""}`
      );
      window.location.href = `mailto:contacto@tytsoftware.com?subject=${subject}&body=${body}`;
    });
  };

  const getParticleCount = () => {
    if (motionState.reduced) return 0;
    const mobile = window.innerWidth < 768;
    const mem = navigator.deviceMemory || 4;
    if (mobile || mem <= 4) return 26;
    return 44;
  };

  const initParticles = () => {
    const count = getParticleCount();
    if (!count) return;

    const canvas = document.createElement("canvas");
    canvas.className = "bg-particles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.35 + 0.12,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let rafId = 0;
    let running = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.fillStyle = `rgba(79, 137, 255, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (running) rafId = requestAnimationFrame(draw);
    };

    const setVisibility = () => {
      running = !document.hidden;
      if (running) {
        cancelAnimationFrame(rafId);
        draw();
      } else {
        cancelAnimationFrame(rafId);
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", setVisibility);

    motionState.particles = {
      destroy: () => {
        running = false;
        cancelAnimationFrame(rafId);
        document.removeEventListener("visibilitychange", setVisibility);
        canvas.remove();
      },
    };
  };

  const initCustomCursor = () => {
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (motionState.reduced || coarsePointer) return;

    const cursor = document.createElement("div");
    cursor.className = "cursor-dot";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const move = (event) => {
      tx = event.clientX;
      ty = event.clientY;
    };

    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(tick);
    };

    document.addEventListener("pointermove", move, { passive: true });
    tick();
  };

  const applyMotionPreference = () => {
    motionState.reduced = reducedMotionQuery.matches;
    html.classList.toggle("reduced-motion", motionState.reduced);

    if (motionState.reduced && motionState.particles) {
      motionState.particles.destroy();
      motionState.particles = null;
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyMotionPreference();
    initLanguage();
    initMobileMenu();
    initNavbarMotion();
    initReveal();
    initCardGlow();
    initScrollIndicator();
    initMailtoForm();
    initParticles();
    initCustomCursor();

    reducedMotionQuery.addEventListener("change", applyMotionPreference);
  });
})();
