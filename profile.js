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
    const previews = {
      accident: '<div class="sensor-ui"><div class="sensor-readout"><small>IMPACT SIGNAL</small><b>0.82 <i>g</i></b><span>DETECTION CANDIDATE</span></div><svg viewBox="0 0 440 140" aria-hidden="true"><path class="wave-grid" d="M0 35H440 M0 70H440 M0 105H440"/><path class="sensor-wave" d="M0 72 L28 72 L43 66 L54 79 L68 72 L88 72 L102 69 L115 76 L128 72 L151 72 L164 15 L176 128 L190 52 L202 78 L217 72 L240 72 L255 69 L268 76 L281 72 L310 72 L325 64 L337 80 L350 72 L375 72 L391 68 L405 76 L440 72"/></svg></div><div class="sensor-bottom"><span>ACCELEROMETER</span><span>GYROSCOPE</span><span>LOCATION STATE</span></div>',
      agent: '<div class="agent-terminal"><div class="terminal-bar"><i></i><i></i><i></i><span>agent_runtime.py</span></div><div class="terminal-code"><p><b>user</b> <span>› inspect repository</span></p><p><b>agent</b> <span>› planning tool call...</span></p><p class="terminal-active"><b>tool</b> <span>› github.read_files()</span></p><p><b>result</b> <span>› awaiting approval</span></p><div class="terminal-cursor"></div></div></div>',
      weather: '<div class="weather-ui"><div class="weather-city">NAVI MUMBAI <small>DEMO VIEW</small></div><div class="weather-main"><div class="sun-icon">☼</div><div><b>28°</b><small>PARTLY CLOUDY</small></div></div><div class="weather-bars"><i style="height:32%"></i><i style="height:55%"></i><i style="height:42%"></i><i style="height:82%"></i><i style="height:66%"></i><i style="height:94%"></i><i style="height:48%"></i><i style="height:72%"></i></div></div>',
      research: '<div class="research-graph"><div class="graph-node node-source">SOURCES</div><div class="graph-node node-agent">AGENT 01</div><div class="graph-node node-agent node-agent-2">AGENT 02</div><div class="graph-node node-core">SYNTHESIS</div><div class="graph-node node-output">CITATIONS</div><svg viewBox="0 0 420 170" aria-hidden="true"><path d="M55 85L150 45L230 85L340 45M55 85L150 125L230 85L340 125"/></svg></div>'
    };
    preview.innerHTML = previews[project.visual] || '<div class="generic-project-preview"><span>ENGINEERING PROJECT</span><b>BUILD / TEST / ITERATE</b></div>';
    visual.append(top,preview);
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