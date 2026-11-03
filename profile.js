document.addEventListener("DOMContentLoaded", () => {
  const slides = [...document.querySelectorAll(".slide")];
  const railItems = [...document.querySelectorAll(".rail-item")];
  const slideNumber = document.getElementById("mobile-slide-number");
  let active = 0;
  const goTo = index => {
    const next = Math.max(0, Math.min(slides.length - 1, Number(index)));
    slides[next]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.next)));
  document.querySelectorAll("[data-next-current]").forEach(button => button.addEventListener("click", () => goTo(active + 1)));
  document.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", () => goTo(active - 1)));
  railItems.forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
  const setActiveSlide = slide => {
    active = Number(slide.dataset.slide);
    railItems.forEach((item, index) => item.classList.toggle("active", index === active));
    if (slideNumber) slideNumber.textContent = String(active + 1).padStart(2, "0") + " / 04";
    slides.forEach(item => item.classList.toggle("is-active", item === slide));
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) setActiveSlide(entry.target);
    }), { threshold: [0.5, 0.7] });
    slides.forEach(slide => observer.observe(slide));
  }
  document.querySelectorAll(".project-card-toggle").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".project-card");
    if (!card) return;
    const flipped = card.classList.toggle("is-flipped");
    card.querySelectorAll(".project-card-toggle").forEach(toggle => toggle.setAttribute("aria-expanded", String(flipped)));
  }));
  document.addEventListener("keydown", event => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") { event.preventDefault(); goTo(active + 1); }
    if (event.key === "ArrowUp" || event.key === "PageUp") { event.preventDefault(); goTo(active - 1); }
    if (event.key === "Home") goTo(0);
    if (event.key === "End") goTo(slides.length - 1);
  });
  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("contact-name-input")?.value.trim();
    const email = document.getElementById("contact-email-input")?.value.trim();
    const message = document.getElementById("contact-message-input")?.value.trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent("Portfolio enquiry from " + name);
    const body = encodeURIComponent(message + "\n\nFrom: " + name + "\nReply to: " + email + "\n\n— Sent from Aliasgar Lohawala's portfolio");
    window.location.href = "mailto:aliasgarlohawal52@gmail.com?subject=" + subject + "&body=" + body;
  });
});