document.addEventListener("DOMContentLoaded", () => {
  const profilePhoto = document.querySelector(".profile-photo");
  if (profilePhoto) profilePhoto.src = "images/aliasgar-lohawala.png";

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "motion.css";
  document.head.append(stylesheet);

  const hero = document.querySelector(".hero");
  const heroGrid = document.querySelector(".hero-grid");
  const heroNote = document.querySelector(".hero-note");
  if (hero && heroGrid) {
    const canvas = document.createElement("canvas");
    canvas.className = "ai-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);
    heroGrid.style.position = "relative";
    heroGrid.style.zIndex = "1";

    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, points = [], frame = 0;
    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(28, Math.min(70, Math.floor(width / 18)));
      points = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        phase: i * .7
      }));
      draw();
    };
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const maxDistance = 135;
      points.forEach((p, i) => {
        if (!reducedMotion) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j], dx = p.x - q.x, dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);
          if (distance < maxDistance) {
            ctx.strokeStyle = "rgba(184,255,92," + ((1 - distance / maxDistance) * .22) + ")";
            ctx.lineWidth = .65;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(184,255,92,.62)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 + Math.sin(frame * .018 + p.phase) * .45, 0, Math.PI * 2); ctx.fill();
      });
      frame++;
      if (!reducedMotion) requestAnimationFrame(draw);
    };
    if (ctx) {
      resize();
      if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);
      else window.addEventListener("resize", resize, { passive: true });
    }
  }

  if (heroGrid) {
    const leftColumn = heroGrid.firstElementChild;
    if (leftColumn) {
      const chips = document.createElement("div");
      chips.className = "hero-hud";
      [
        ["PYTHON / FASTAPI", "Backend systems"],
        ["LLM / RAG", "AI applications"],
        ["BUILD → TEST → ITERATE", "Engineering loop"]
      ].forEach(([label]) => {
        const chip = document.createElement("span");
        chip.className = "hud-chip";
        const dot = document.createElement("i");
        const text = document.createElement("span");
        text.textContent = label;
        chip.append(dot, text);
        chips.append(chip);
      });
      leftColumn.append(chips);
    }
  }

  if (heroNote) {
    const label = document.createElement("p");
    label.className = "system-label";
    label.textContent = "LIVE SYSTEM / CONCEPT MAP";
    const visual = document.createElement("div");
    visual.className = "system-visual";
    visual.setAttribute("aria-label", "Illustration of connected AI system components");
    visual.innerHTML = '<svg viewBox="0 0 340 150" role="img" aria-hidden="true"><defs><radialGradient id="coreGlow"><stop stop-color="#b8ff5c" stop-opacity=".4"/><stop offset="1" stop-color="#b8ff5c" stop-opacity="0"/></radialGradient></defs><circle cx="170" cy="75" r="48" fill="url(#coreGlow)"/><g fill="none" stroke="#b8ff5c" stroke-opacity=".34"><path class="pulse-path" d="M38 34L112 75L170 75L229 34L302 48M38 116L112 75L229 116L302 102M38 34L38 116M302 48L302 102"/><circle cx="170" cy="75" r="27"/><circle cx="170" cy="75" r="43" stroke-opacity=".14"/></g><g fill="#b8ff5c"><circle class="node-pulse" cx="38" cy="34" r="4"/><circle cx="38" cy="116" r="4"/><circle class="node-pulse" cx="302" cy="48" r="4"/><circle cx="302" cy="102" r="4"/><circle cx="112" cy="75" r="4"/><circle cx="229" cy="34" r="4"/><circle cx="229" cy="116" r="4"/><circle cx="170" cy="75" r="7"/></g><g fill="#c8d8ca" font-family="monospace" font-size="8"><text x="17" y="23">INPUT</text><text x="145" y="117">MODEL</text><text x="269" y="27">OUTPUT</text></g></svg>';
    const readout = document.createElement("div");
    readout.className = "system-readout";
    readout.innerHTML = '<div><small>ARCHITECTURE</small><b>DATA → MODEL → API</b></div><div><small>APPROACH</small><b>BUILD / EVALUATE</b></div>';
    const mono = heroNote.querySelector(".mono");
    if (mono) mono.insertAdjacentElement("afterend", label);
    label.insertAdjacentElement("afterend", visual);
    visual.insertAdjacentElement("afterend", readout);
  }

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.append(glow);
  if (window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("pointermove", event => {
      glow.style.left = event.clientX + "px";
      glow.style.top = event.clientY + "px";
    }, { passive: true });
  }

  const revealTargets = document.querySelectorAll(".section-head, .expertise-card, .about-grid > div, .resume-block, .stat-card, .contact > *");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -35px 0px" });
    revealTargets.forEach((element, index) => {
      element.classList.add("section-reveal");
      element.style.transitionDelay = (index % 4) * 75 + "ms";
      observer.observe(element);
    });
  }

  const grid = document.getElementById("github-projects");
  const status = document.getElementById("github-sync-status");
  if (!grid) return;

  const username = "HiiAliasgar";
  const cacheKey = "aliasgar_curated_projects_v3";
  const cacheTtlMs = 10 * 60 * 1000;
  const featuredOrder = ["Accident-Guard", "weatherProject", "aliasgar-ai"];
  const projectDetails = {
    "Accident-Guard": {
      title: "AccidentGuard", label: "FLAGSHIP PROJECT",
      description: "An experimental Android application exploring smartphone motion-sensor signals, crash-candidate detection, location display and alert workflows. Built across React, TypeScript, Capacitor and Android. Not a certified safety system.",
      focus: "Mobile · Sensors · Applied ML", monogram: "AG"
    },
    "weatherProject": {
      title: "Weather Forecast", label: "FULL-STACK WEB APPLICATION",
      description: "A Django-based weather application with city search, current-condition presentation and weather-data visualizations. Demonstrates server-side web development and data presentation.",
      focus: "Python · Django · Data Visualization", monogram: "WX"
    },
    "aliasgar-ai": {
      title: "Aliasgar AI", label: "AI ENGINEERING",
      description: "A personal engineering agent with FastAPI, LLM tool calling, GitHub read tools and approval-gated repository changes.",
      focus: "LLM tools · FastAPI · GitHub API", monogram: "AI"
    }
  };

  const setStatus = message => { if (status) status.textContent = message; };
  function safeUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
    } catch { return null; }
  }
  function makeLink(href, label, className) {
    const link = document.createElement("a");
    link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer";
    link.textContent = label; link.className = className || "";
    return link;
  }
  function createProjectCard(repo) {
    const detail = projectDetails[repo.name];
    const card = document.createElement("article");
    card.className = "project" + (repo.name === "Accident-Guard" ? " featured flagship-project" : "");
    const visual = document.createElement("div");
    visual.className = "project-visual github-project-visual";
    const visualLabel = document.createElement("span");
    visualLabel.className = "mono"; visualLabel.textContent = detail.label;
    const monogram = document.createElement("div");
    monogram.className = "github-project-monogram"; monogram.textContent = detail.monogram;
    const visualFooter = document.createElement("div");
    visualFooter.className = "github-project-visual-footer"; visualFooter.textContent = detail.focus;
    visual.append(visualLabel, monogram, visualFooter);

    const info = document.createElement("div"); info.className = "project-info";
    const details = document.createElement("div");
    const title = document.createElement("h3"); title.textContent = detail.title;
    const description = document.createElement("p"); description.textContent = detail.description;
    details.append(title, description);
    const bottom = document.createElement("div"); bottom.className = "project-bottom github-project-bottom";
    const meta = document.createElement("span");
    meta.textContent = (repo.language || "Multiple languages") + " · " + Number(repo.stargazers_count || 0) + " stars";
    const links = document.createElement("div"); links.className = "github-project-links";
    const repositoryUrl = safeUrl(repo.html_url);
    if (repositoryUrl) links.append(makeLink(repositoryUrl, "Source code ↗", "github-repo-link"));
    const demoUrl = safeUrl(repo.homepage || "");
    if (demoUrl) links.append(makeLink(demoUrl, "Live application ↗", "github-demo-link"));
    bottom.append(meta, links); info.append(details, bottom); card.append(visual, info);
    return card;
  }
  function renderRepositories(repositories) {
    const byName = new Map(repositories.map(repo => [repo.name, repo]));
    const selected = featuredOrder.map(name => byName.get(name)).filter(repo => repo && !repo.fork && !repo.archived);
    grid.replaceChildren();
    if (!selected.length) {
      const empty = document.createElement("p");
      empty.className = "github-project-placeholder";
      empty.textContent = "Selected project details are temporarily unavailable. Browse the source repositories on GitHub.";
      grid.append(empty);
    } else selected.forEach(repo => grid.append(createProjectCard(repo)));
    setStatus("Showing " + selected.length + " selected projects. The full repository list remains on GitHub.");
  }
  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Array.isArray(cached.repositories)) return cached;
    } catch { /* Browser storage may be unavailable. */ }
    return null;
  }
  async function loadRepositories() {
    const cached = readCache();
    if (cached && Date.now() - cached.savedAt < cacheTtlMs) {
      renderRepositories(cached.repositories);
      setStatus("Showing selected projects · checking GitHub for updates…");
    }
    try {
      const response = await fetch("https://api.github.com/users/" + username + "/repos?type=owner&sort=updated&per_page=100", {
        headers: { Accept: "application/vnd.github+json" }, cache: "no-store"
      });
      if (!response.ok) throw new Error("GitHub API returned HTTP " + response.status);
      const repositories = await response.json();
      if (!Array.isArray(repositories)) throw new Error("Unexpected GitHub API response");
      try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), repositories })); }
      catch { /* The portfolio remains usable without browser storage. */ }
      renderRepositories(repositories);
    } catch {
      if (cached) {
        renderRepositories(cached.repositories);
        setStatus("Showing cached selected projects; live refresh failed.");
      } else {
        grid.replaceChildren();
        const message = document.createElement("p");
        message.className = "github-project-placeholder";
        message.textContent = "The selected project feed is temporarily unavailable. Use the source links on GitHub to browse the work.";
        grid.append(message);
        setStatus("Could not refresh selected projects from GitHub.");
      }
    }
  }
  loadRepositories();
});