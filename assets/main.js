(() => {
  const storageKey = "tyt-lang";
  const html = document.documentElement;

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

  const initReveal = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
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

  document.addEventListener("DOMContentLoaded", () => {
    initLanguage();
    initMobileMenu();
    initReveal();
    initMailtoForm();
  });
})();
