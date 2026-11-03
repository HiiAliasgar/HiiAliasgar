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

  document.addEventListener("keydown", event => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    const gallery = document.getElementById("github-projects");
    if (gallery && document.activeElement === gallery && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const card = gallery.querySelector(".project-card");
      if (card) gallery.scrollBy({ left: (event.key === "ArrowRight" ? 1 : -1) * (card.getBoundingClientRect().width + 16), behavior: "smooth" });
      return;
    }
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

  const track = document.getElementById("github-projects");
  const footer = document.querySelector(".projects-footer");
  if (track && footer) {
    const cards = [...track.querySelectorAll(".project-card")];
    const controls = document.createElement("div");
    controls.className = "project-slider-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.setAttribute("aria-label", "Previous projects");
    previous.textContent = "←";
    const counter = document.createElement("span");
    counter.className = "project-slider-count";
    counter.setAttribute("aria-live", "polite");
    const next = document.createElement("button");
    next.type = "button";
    next.setAttribute("aria-label", "Next projects");
    next.textContent = "→";
    const gapSize = () => {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 16;
    };
    const cardStep = () => (cards[0]?.getBoundingClientRect().width || 300) + gapSize();
    const nearestCardIndex = () => {
      const trackLeft = track.getBoundingClientRect().left;
      let nearest = 0, distance = Infinity;
      cards.forEach((card, index) => {
        const current = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (current < distance) { distance = current; nearest = index; }
      });
      return nearest;
    };
    const updateControls = () => {
      const index = nearestCardIndex();
      counter.textContent = String(index + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      previous.setAttribute("aria-disabled", String(previous.disabled));
      next.setAttribute("aria-disabled", String(next.disabled));
    };
    const move = direction => track.scrollBy({
      left: direction * cardStep(),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    let pointerStart = null, suppressClickUntil = 0;
    track.addEventListener("pointerdown", event => {
      if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("a, button")) return;
      pointerStart = { x: event.clientX, scrollLeft: track.scrollLeft, moved: false, id: event.pointerId };
      track.classList.add("is-dragging");
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener("pointermove", event => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const delta = event.clientX - pointerStart.x;
      if (Math.abs(delta) > 4) pointerStart.moved = true;
      if (pointerStart.moved) {
        track.scrollLeft = pointerStart.scrollLeft - delta;
        suppressClickUntil = Date.now() + 250;
      }
    });
    const finishPointer = event => {
      if (!pointerStart || (event && pointerStart.id !== event.pointerId)) return;
      pointerStart = null;
      track.classList.remove("is-dragging");
      updateControls();
    };
    track.addEventListener("pointerup", finishPointer);
    track.addEventListener("pointercancel", finishPointer);
    track.addEventListener("lostpointercapture", finishPointer);
    track.addEventListener("click", event => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    controls.append(previous, counter, next);
    footer.append(controls);
    updateControls();
  }
});