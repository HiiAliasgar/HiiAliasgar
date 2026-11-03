document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("slides");
  const slides = [...document.querySelectorAll(".slide")];
  const railItems = [...document.querySelectorAll(".rail-item")];
  const number = document.getElementById("mobile-slide-number");
  let active = 0, scrolling = false;
  const goTo = index => {
    const next = Math.max(0, Math.min(slides.length - 1, Number(index)));
    slides[next].scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
  };
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.next)));
  document.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", () => goTo(active - 1)));
  railItems.forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > .5) {
        active = Number(entry.target.dataset.slide);
        railItems.forEach((item, i) => item.classList.toggle("active", i === active));
        if (number) number.textContent = String(active + 1).padStart(2,"0") + " / 04";
        entry.target.classList.add("is-active");
        slides.filter(slide => slide !== entry.target).forEach(slide => slide.classList.remove("is-active"));
      }
    });
  }, {root:container, threshold:[.5,.7]});
  slides.forEach(slide => observer.observe(slide));
  document.addEventListener("keydown", event => {
    if (["ArrowDown","PageDown"," "].includes(event.key) && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault(); goTo(active + 1);
    } else if (["ArrowUp","PageUp"].includes(event.key)) {
      event.preventDefault(); goTo(active - 1);
    } else if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(slides.length - 1);
  });
  const githubProjects = document.getElementById("github-projects");
  const syncStatus = document.getElementById("github-sync-status");
  if (!githubProjects) return;
  const featured = [
    {name:"Accident-Guard",title:"AccidentGuard",category:"MOBILE SYSTEMS",stack:["React","TypeScript","Capacitor","Android"],description:"Experimental smartphone motion-sensor prototype for crash-candidate detection and a location-aware alert workflow. Not a certified safety system.",href:"https://github.com/HiiAliasgar/Accident-Guard",visual:"accident",meta:"MOBILE / SENSOR SYSTEMS"},
    {name:"aliasgar-ai",title:"Aliasgar AI",category:"AI DEVELOPER TOOLS",stack:["Python","FastAPI","LLM Tool Calling"],description:"A personal engineering agent using LLM tool calling, GitHub read tools and approval-gated repository changes.",href:"https://github.com/HiiAliasgar/aliasgar-ai",visual:"agent",meta:"LLM / BACKEND"},
    {name:"weatherProject",title:"Weather Forecast",category:"FULL-STACK WEB",stack:["Python","Django","Weather API"],description:"Django weather application with city search, current-condition presentation and weather-data visualisation.",href:"https://github.com/HiiAliasgar/weatherProject",visual:"weather",meta:"PYTHON / DJANGO"},
    {name:"lab_research_lab",title:"Agent Research Lab",category:"RESEARCH SYSTEMS",stack:["Python","Research Agents","Citation Tracking"],description:"Multi-agent research workflow combining web and academic sources with citation tracking.",href:"https://github.com/HiiAliasgar/lab_research_lab",visual:"research",meta:"MULTI-AGENT / RESEARCH"}
  ];
  const makeCard = project => {
    const card = document.createElement("article"); card.className = "project-card";
    const visual = document.createElement("div"); visual.className = "project-visual " + (project.visual || "agent") + "-visual";
    const top = document.createElement("div"); top.className = "visual-top";
    const label = document.createElement("span"); label.textContent = project.title.toUpperCase() + " / " + project.category;
    const live = document.createElement("span"); live.className = "live-indicator"; live.textContent = "● GITHUB PROJECT"; top.append(label,live);
    const preview = document.createElement("div"); preview.className = "dynamic-preview";
    const glyph = document.createElement("b"); glyph.textContent = project.visual === "accident" ? "AG" : project.visual === "weather" ? "WX" : project.visual === "research" ? "AR" : "AI";
    preview.append(glyph); visual.append(top,preview);
    const meta = document.createElement("div"); meta.className = "project-meta";
    const category = document.createElement("span"); category.textContent = project.category;
    const focus = document.createElement("span"); focus.textContent = project.meta || "SOFTWARE ENGINEERING"; meta.append(category,focus);
    const title = document.createElement("h3"); title.textContent = project.title;
    const desc = document.createElement("p"); desc.textContent = project.description;
    const tags = document.createElement("div"); tags.className = "project-tags";
    (project.stack || []).slice(0,4).forEach(value => { const tag=document.createElement("span");tag.textContent=value;tags.append(tag);});
    const link = document.createElement("a"); link.className="project-link";link.href=project.href;link.target="_blank";link.rel="noreferrer";link.append(document.createTextNode("EXPLORE REPOSITORY"));const arrow=document.createElement("b");arrow.textContent="↗";link.append(arrow);
    card.append(visual,meta,title,desc,tags,link);return card;
  };
  const render = projects => {
    githubProjects.replaceChildren();
    projects.slice(0,5).forEach(project => githubProjects.append(makeCard(project)));
    if (syncStatus) syncStatus.textContent = "FEATURED PROJECTS + RECENT PUBLIC REPOSITORIES · GITHUB SYNCED";
  };
  const fetchProjects = async () => {
    try {
      const response = await fetch("https://api.github.com/users/HiiAliasgar/repos?type=owner&sort=updated&per_page=100", {headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
      if (!response.ok) throw new Error("GitHub API unavailable");
      const repos = await response.json();
      const map = new Map(repos.filter(repo => !repo.fork && !repo.archived).map(repo => [repo.name,repo]));
      const curated = featured.map(item => map.has(item.name) ? {...item,href:map.get(item.name).html_url,stack:item.stack.length ? item.stack : [map.get(item.name).language].filter(Boolean)} : item);
      const known = new Set(curated.map(item => item.name));
      const extras = repos.filter(repo => !repo.fork && !repo.archived && !known.has(repo.name))
        .sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at)).slice(0,1)
        .map(repo=>({name:repo.name,title:repo.name.replace(/[-_]/g," "),category:"GITHUB PROJECT",stack:[repo.language,...(repo.topics||[]).slice(0,3)].filter(Boolean),description:repo.description||"A public software project. Open the repository for implementation details and current status.",href:repo.html_url,visual:"agent",meta:repo.language||"SOFTWARE"}));
      render([...curated,...extras]);
    } catch {
      render(featured);
      if(syncStatus) syncStatus.textContent = "SHOWING CURATED PROJECTS · LIVE GITHUB REFRESH UNAVAILABLE";
    }
  };
  fetchProjects();
});