document.addEventListener("DOMContentLoaded", () => {
  const slides = [...document.querySelectorAll(".slide")];
  const railItems = [...document.querySelectorAll(".rail-item")];
  const slideNumber = document.getElementById("mobile-slide-number");
  let active = 0;

  const goTo = index => {
    const next = Math.max(0, Math.min(slides.length - 1, Number(index)));
    slides[next]?.scrollIntoView({behavior: "smooth", block: "start"});
  };
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.next)));
  document.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", () => goTo(active - 1)));
  railItems.forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || entry.intersectionRatio < .5) return;
    active = Number(entry.target.dataset.slide);
    railItems.forEach((item, i) => item.classList.toggle("active", i === active));
    if (slideNumber) slideNumber.textContent = String(active + 1).padStart(2, "0") + " / 05";
    slides.forEach(slide => slide.classList.toggle("is-active", slide === entry.target));
  }), {threshold: [.5, .7]});
  slides.forEach(slide => observer.observe(slide));

  document.addEventListener("keydown", event => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") { event.preventDefault(); goTo(active + 1); }
    if (event.key === "ArrowUp" || event.key === "PageUp") { event.preventDefault(); goTo(active - 1); }
    if (event.key === "Home") goTo(0);
    if (event.key === "End") goTo(slides.length - 1);
  });


  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.getElementById("contact-message-input")?.value.trim();
    if (!message) return;
    const subject = encodeURIComponent("Portfolio enquiry / collaboration");
    const body = encodeURIComponent(message + "\\n\\n— Sent from Aliasgar Lohawala's portfolio");
    window.location.href = "mailto:aliasgarlohawal52@gmail.com?subject=" + subject + "&body=" + body;
  });

  const track = document.getElementById("github-projects");
  const status = document.getElementById("github-sync-status");
  if (!track) return;

  const featuredOrder = ["Accident-Guard", "aliasgar-ai", "lab_research_lab", "support-ticketing-crm", "Rag_Application", "weatherProject", "AI-Resume-Critiquer"];
  const known = {
    "Accident-Guard": {title:"AccidentGuard", category:"MOBILE SYSTEMS", stack:["React","TypeScript","Capacitor","Android"], description:"Experimental smartphone motion-sensor prototype for crash-candidate detection and a location-aware alert workflow. Not a certified safety system."},
    "aliasgar-ai": {title:"Aliasgar AI Agent", category:"AI AGENT SYSTEMS", stack:["Python","FastAPI","LLM Tool Calling","GitHub API"], description:"LLM-powered engineering agent with structured tool calling, GitHub repository inspection and human-approved changes that produce draft pull requests."},
    "lab_research_lab": {title:"Agent Research Lab", category:"RESEARCH SYSTEMS", stack:["Python","FastAPI","LangGraph","OpenAlex"], description:"Multi-agent research workflow that investigates web and academic sources, then synthesizes cited reports with a review loop."},
    "weatherProject": {title:"Weather Forecast", category:"FULL-STACK WEB", stack:["Python","Django"], description:"Django weather application for city-based conditions and weather-data presentation."},
    "support-ticketing-crm": {title:"SupportTick CRM", category:"BACKEND / FULL-STACK", stack:["FastAPI","React","SQLite"], description:"Ticket-management application with search, filtering, status updates, internal notes and a dashboard."},
    "Rag_Application": {title:"RAG Application", category:"GENERATIVE AI", stack:["Python","ChromaDB","Embeddings","LLM"], description:"Document question-answering workflow with PDF ingestion, chunking, vector retrieval and source-grounded responses."},
    "AI-Resume-Critiquer": {title:"AI Resume Critiquer", category:"GENERATIVE AI", stack:["Python","Streamlit","Groq API"], description:"Resume feedback application that reviews PDF or text resumes against a target role."}
  };

  const makeCard = repo => {
    const details = known[repo.name] || {};
    const card = document.createElement("article");
    card.className = "project-card";
    const visual = document.createElement("div");
    visual.className = "project-visual github-project-visual";
    const image = document.createElement("img");
    image.loading = "lazy";
    visual.classList.add("preview-fallback");
    const preview = document.createElement("div");
    preview.className = "project-preview-label";
    const previewKicker = document.createElement("span");
    previewKicker.textContent = details.category || "ENGINEERING PROJECT";
    const previewName = document.createElement("strong");
    previewName.textContent = details.title || repo.name.replace(/[-_]/g, " ");
    const previewStack = document.createElement("small");
    previewStack.textContent = (details.stack || [repo.language].filter(Boolean)).slice(0, 3).join("  /  ");
    preview.append(previewKicker, previewName, previewStack);
    visual.append(preview);

    const meta = document.createElement("div");
    meta.className = "project-meta";
    const category = document.createElement("span");
    category.textContent = details.category || (repo.language ? repo.language.toUpperCase() : "GITHUB PROJECT");
    const updated = document.createElement("span");
    updated.textContent = "UPDATED " + new Date(repo.updated_at).toLocaleDateString("en-IN", {month:"short", year:"numeric"}).toUpperCase();
    meta.append(category, updated);

    const title = document.createElement("h3");
    title.textContent = details.title || repo.name.replace(/[-_]/g, " ");
    const description = document.createElement("p");
    description.textContent = details.description || repo.description || "Open the repository to explore source code, documentation and implementation details.";
    const tags = document.createElement("div");
    tags.className = "project-tags";
    (details.stack || [repo.language, ...(repo.topics || []).slice(0, 3)].filter(Boolean)).slice(0, 4).forEach(value => {
      const tag = document.createElement("span"); tag.textContent = value; tags.append(tag);
    });
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.append(document.createTextNode("VIEW PROJECT"));
    const arrow = document.createElement("b"); arrow.textContent = "↗"; link.append(arrow);
    card.append(visual, meta, title, description, tags, link);
    return card;
  };

  const render = repos => {
    const ordered = [...repos].sort((a, b) => {
      const ai = featuredOrder.indexOf(a.name), bi = featuredOrder.indexOf(b.name);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    track.replaceChildren(...ordered.map(makeCard));
    const controls = document.createElement("div");
    controls.className = "project-slider-controls";
    const previous = document.createElement("button");
    previous.type = "button"; previous.setAttribute("aria-label", "Previous projects"); previous.textContent = "←";
    const counter = document.createElement("span"); counter.className = "project-slider-count";
    const next = document.createElement("button");
    next.type = "button"; next.setAttribute("aria-label", "Next projects"); next.textContent = "→";
    const updateCounter = () => {
      const first = Math.round(track.scrollLeft / Math.max(1, track.clientWidth * .82)) + 1;
      counter.textContent = String(Math.min(first, ordered.length)).padStart(2, "0") + " / " + String(ordered.length).padStart(2, "0");
    };
    previous.addEventListener("click", () => track.scrollBy({left: -track.clientWidth * .82, behavior:"smooth"}));
    next.addEventListener("click", () => track.scrollBy({left: track.clientWidth * .82, behavior:"smooth"}));
    track.addEventListener("scroll", updateCounter, {passive:true});
    controls.append(previous, counter, next);
    const footer = document.querySelector(".projects-footer");
    footer?.append(controls);
    updateCounter();
    if (status) status.textContent = "7 CURATED PROJECTS · LIVE FROM GITHUB";
  };

  const loadProjects = async () => {
    try {
      const repos = [];
      for (let page = 1; ; page++) {
        const response = await fetch("https://api.github.com/users/HiiAliasgar/repos?type=owner&sort=updated&per_page=100&page=" + page, {
          headers: {Accept:"application/vnd.github+json"}, cache:"no-store"
        });
        if (!response.ok) throw new Error("GitHub API returned " + response.status);
        const batch = await response.json();
        repos.push(...batch);
        if (batch.length < 100) break;
      }
      const curated = new Set(featuredOrder);
      const publicProjects = repos.filter(repo => curated.has(repo.name) && !repo.fork && !repo.archived && !repo.private);
      render(publicProjects);
    } catch (error) {
      if (status) status.textContent = "GITHUB COULD NOT BE REACHED · CHECK BACK LATER";
      track.replaceChildren();
      const message = document.createElement("p");
      message.className = "github-error";
      message.textContent = "Projects could not be loaded right now. Visit the GitHub profile to browse repositories.";
      track.append(message);
    }
  };
  loadProjects();
});