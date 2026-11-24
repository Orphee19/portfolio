(function () {
  "use strict";

  const cfg = window.PORTFOLIO_CONFIG || {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  /* ---- Mobile nav ---- */
  const menuBtn = $("#menu-open-btn");
  const mobileMenu = $("#mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    $all("#mobile-menu a").forEach((a) => {
      a.addEventListener("click", () => mobileMenu.classList.add("hidden"));
    });
  }

  /* ---- Typing effect ---- */
  const typingEl = $("#typing-text");
  const roles = [
    "Développeur full-stack Python",
    "Ingénieur Génie Logiciel",
    "Développeur backend C/C++",
    "Formateur programation",
    "Infographe designeur Photoshop/Canva",
  ];
  if (typingEl) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        typingEl.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        typingEl.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 90);
    }
    tick();
  }

  /* ---- Photo / CTA float ---- */
  ["#photo-anim-container", "#div-anim-container"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    setInterval(() => el.classList.toggle("translate-y-4"), 3000);
  });

  /* ---- Video modal ---- */
  const videoModal = $("#video-modal");
  const videoPlayer = $("#project-video-player");
  const modalTitle = $("#video-modal-title");
  const closeVideoBtn = $("#close-modal-btn");

  function openVideoModal(btn) {
    if (!videoModal || !videoPlayer) return;
    const src = btn.getAttribute("data-video-src");
    modalTitle.textContent = "Démonstration : " + btn.textContent.trim();
    videoPlayer.src = src;
    videoPlayer.load();
    videoModal.classList.remove("hidden");
    videoModal.classList.add("flex");
    videoPlayer.play().catch(() => {});
  }

  function closeVideoModal() {
    if (!videoModal || !videoPlayer) return;
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();
    videoModal.classList.add("hidden");
    videoModal.classList.remove("flex");
  }

  $all("[data-video-src]").forEach((btn) => {
    btn.addEventListener("click", () => openVideoModal(btn));
  });
  if (closeVideoBtn) closeVideoBtn.addEventListener("click", closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeVideoModal();
      const collab = $("#collaboration-modal");
      if (collab) collab.classList.add("hidden");
    }
  });

  /* ---- Projects horizontal gallery + arrows (no auto-scroll) ---- */
  const projectsTrack = $("#projects-container");
  const projectsMarquee = $("#projects-marquee");
  const projectsPrev = $("#projects-prev");
  const projectsNext = $("#projects-next");
  if (projectsTrack && projectsMarquee) {
    const stepSize = () => {
      const card = projectsTrack.querySelector(".project-card");
      if (!card) return 280;
      const styles = getComputedStyle(projectsTrack);
      const gap = parseFloat(styles.gap) || 16;
      return card.getBoundingClientRect().width + gap;
    };

    const jumpBy = (dir) => {
      projectsMarquee.scrollBy({ left: dir * stepSize(), behavior: "smooth" });
    };

    if (projectsPrev) projectsPrev.addEventListener("click", () => jumpBy(-1));
    if (projectsNext) projectsNext.addEventListener("click", () => jumpBy(1));
  }

  /* ---- Collaboration modal ---- */
  const collabModal = $("#collaboration-modal");
  const openCollab = $("#open-modal-btn");
  const closeCollab = $("#close-collab-btn");
  if (openCollab && collabModal) {
    openCollab.addEventListener("click", (e) => {
      e.preventDefault();
      collabModal.classList.remove("hidden");
    });
  }
  if (closeCollab && collabModal) {
    closeCollab.addEventListener("click", () => collabModal.classList.add("hidden"));
  }

  /* ---- Email helpers ---- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  }

  async function sendViaBrevo(payload) {
    const url = (cfg.brevoProxyUrl || "").trim();
    if (!url) return null;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status !== "success") {
      throw new Error(data.message || "Échec de l'envoi Brevo");
    }
    return data;
  }

  async function sendViaFormSubmit(payload) {
    const email = cfg.contactEmail;
    if (!email) throw new Error("Email de contact non configuré");
    const body = new FormData();
    Object.entries(payload).forEach(([k, v]) => body.append(k, v == null ? "" : String(v)));
    body.append("_subject", payload.subject || "Nouveau message portfolio");
    body.append("_template", "table");
    body.append("_captcha", "false");
    if (payload.email) body.append("_replyto", String(payload.email));
    if (payload.name) body.append("_name", String(payload.name));
    const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(email), {
      method: "POST",
      body,
      headers: { Accept: "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === "false") {
      throw new Error(data.message || "Échec de l'envoi");
    }
    return data;
  }

  async function deliverMail(payload) {
    if ((cfg.brevoProxyUrl || "").trim()) {
      return sendViaBrevo(payload);
    }
    return sendViaFormSubmit(payload);
  }

  /* ---- Contact form ---- */
  const contactForm = $("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = $("#contact-name").value.trim();
      const email = $("#contact-email").value.trim();
      const message = $("#contact-message").value.trim();
      const honey = $("#contact-website");
      const nameError = $("#name-error");
      const emailError = $("#email-error");
      const messageError = $("#message-error");
      const formSuccess = $("#form-success");
      const formError = $("#form-error");
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      let ok = true;
      nameError.classList.toggle("hidden", name.length >= 2);
      if (name.length < 2) ok = false;
      emailError.classList.toggle("hidden", isValidEmail(email));
      if (!isValidEmail(email)) ok = false;
      messageError.classList.toggle("hidden", message.length >= 10);
      if (message.length < 10) ok = false;
      if (honey && honey.value) return;
      if (!ok) return;

      formSuccess.classList.add("hidden");
      formError.classList.add("hidden");
      submitBtn.disabled = true;
      const prev = submitBtn.textContent;
      submitBtn.textContent = "Envoi...";

      try {
        await deliverMail({
          type: "contact",
          name,
          email,
          message,
          website: honey ? honey.value : "",
          subject: "Portfolio — message de " + name,
        });
        formSuccess.textContent = "Message envoyé. Je vous répondrai par e-mail.";
        formSuccess.classList.remove("hidden");
        contactForm.reset();
        setTimeout(() => formSuccess.classList.add("hidden"), 5000);
      } catch (err) {
        formError.textContent = "❌ " + (err.message || "Erreur d'envoi");
        formError.classList.remove("hidden");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = prev;
      }
    });
  }

  /* ---- Collaboration form ---- */
  const collabForm = $("#collaboration-form");
  if (collabForm) {
    collabForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fd = new FormData(collabForm);
      if (fd.get("website")) return;

      const payload = {
        type: "collaboration",
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        project_type: String(fd.get("project_type") || ""),
        project_budget: String(fd.get("project_budget") || ""),
        project_duration: String(fd.get("project_duration") || ""),
        message: String(fd.get("message") || "").trim(),
        subject: "Portfolio — demande de collaboration",
      };

      const modalSuccess = $("#modal-form-success");
      const modalError = $("#modal-form-error");
      const btn = $("#modal-submit-btn");

      if (
        !payload.name ||
        !isValidEmail(payload.email) ||
        !payload.project_type ||
        !payload.message
      ) {
        modalError.textContent = "❌ Merci de remplir correctement tous les champs.";
        modalError.classList.remove("hidden");
        return;
      }

      modalSuccess.classList.add("hidden");
      modalError.classList.add("hidden");
      btn.disabled = true;
      btn.textContent = "Envoi...";

      try {
        await deliverMail(payload);
        modalSuccess.classList.remove("hidden");
        collabForm.reset();
        setTimeout(() => collabModal && collabModal.classList.add("hidden"), 2500);
      } catch (err) {
        modalError.textContent = "❌ " + (err.message || "Erreur d'envoi");
        modalError.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Envoyer la demande";
      }
    });
  }

  /* ---- Year ---- */
  const yearEl = $("#footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
