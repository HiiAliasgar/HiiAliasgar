document.addEventListener("DOMContentLoaded", () => {
  const slides = [...document.querySelectorAll(".slide")];
  const railItems = [...document.querySelectorAll(".rail-item")];
  const slideNumber = document.getElementById("mobile-slide-number");
  let active = 0;

  const goTo = index => {
    const next = Math.max(0, Math.min(slides.length - 1, Number(index)));
    slides[next]?.scrollIntoView({behavior:"smooth", block:"start"});
  };
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.next)));
  document.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", () => goTo(active - 1)));
  railItems.forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || entry.intersectionRatio < .5) return;
    active = Number(entry.target.dataset.slide);
    railItems.forEach((item, i) => item.classList.toggle("active", i === active));
    if (slideNumber) slideNumber.textContent = String(active + 1).padStart(2, "0") + " / 04";
    slides.forEach(slide => slide.classList.toggle("is-active", slide === entry.target));
  }), {threshold:[.5,.7]});
  slides.forEach(slide => observer.observe(slide));

  document.addEventListener("keydown", event => {
    if (["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
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
    const controls = document.createElement("div");
    controls.className = "project-slider-controls";
    const previous = document.createElement("button");
    previous.type = "button"; previous.setAttribute("aria-label","Previous projects"); previous.textContent = "←";
    const counter = document.createElement("span"); counter.className = "project-slider-count";
    const next = document.createElement("button");
    next.type = "button"; next.setAttribute("aria-label","Next projects"); next.textContent = "→";
    const cards = [...track.querySelectorAll(".project-card")];
    const updateCounter = () => {
      const first = Math.min(cards.length, Math.round(track.scrollLeft / Math.max(1, cards[0]?.getBoundingClientRect().width + 18 || 1)) + 1);
      counter.textContent = String(first).padStart(2,"0") + " / " + String(cards.length).padStart(2,"0");
    };
    previous.addEventListener("click", () => track.scrollBy({left:-track.clientWidth * .8,behavior:"smooth"}));
    next.addEventListener("click", () => track.scrollBy({left:track.clientWidth * .8,behavior:"smooth"}));
    track.addEventListener("scroll", updateCounter, {passive:true});
    controls.append(previous,counter,next);
    footer.append(controls);
    updateCounter();
  }
});