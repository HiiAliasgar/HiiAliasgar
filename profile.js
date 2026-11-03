document.addEventListener("DOMContentLoaded", () => {
  const profilePhoto = document.querySelector(".profile-photo");
  if (profilePhoto) profilePhoto.src = "images/aliasgar-lohawala.png";

  const grid = document.getElementById("github-projects");
  const status = document.getElementById("github-sync-status");
  if (!grid) return;

  const username = "HiiAliasgar";
  const cacheKey = "aliasgar_curated_projects_v3";
  const cacheTtlMs = 10 * 60 * 1000;
  const featuredOrder = ["Accident-Guard", "weatherProject", "aliasgar-ai"];
  const projectDetails = {
    "Accident-Guard": {
      title: "AccidentGuard",
      label: "FLAGSHIP PROJECT",
      description: "An experimental Android application exploring smartphone motion-sensor signals, crash-candidate detection, location display and alert workflows. Built across React, TypeScript, Capacitor and Android. Not a certified safety system.",
      focus: "Mobile · Sensors · Applied ML",
      monogram: "AG"
    },
    "weatherProject": {
      title: "Weather Forecast",
      label: "FULL-STACK WEB APPLICATION",
      description: "A Django-based weather application with city search, current-condition presentation and weather-data visualizations. Demonstrates server-side web development and data presentation.",
      focus: "Python · Django · Data Visualization",
      monogram: "WX"
    },
    "aliasgar-ai": {
      title: "Aliasgar AI",
      label: "AI ENGINEERING",
      description: "A personal engineering agent with FastAPI, LLM tool calling, GitHub read tools and approval-gated repository changes.",
      focus: "LLM tools · FastAPI · GitHub API",
      monogram: "AI"
    }
  };

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
    } catch {
      return null;
    }
  }

  function makeLink(href, label, className) {
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    link.className = className || "";
    return link;
  }

  function createProjectCard(repo) {
    const detail = projectDetails[repo.name];
    const card = document.createElement("article");
    card.className = "project" + (repo.name === "Accident-Guard" ? " featured flagship-project" : "");

    const visual = document.createElement("div");
    visual.className = "project-visual github-project-visual";
    const visualLabel = document.createElement("span");
    visualLabel.className = "mono";
    visualLabel.textContent = detail.label;
    const monogram = document.createElement("div");
    monogram.className = "github-project-monogram";
    monogram.textContent = detail.monogram;
    const visualFooter = document.createElement("div");
    visualFooter.className = "github-project-visual-footer";
    visualFooter.textContent = detail.focus;
    visual.append(visualLabel, monogram, visualFooter);

    const info = document.createElement("div");
    info.className = "project-info";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = detail.title;
    const description = document.createElement("p");
    description.textContent = detail.description;
    details.append(title, description);

    const bottom = document.createElement("div");
    bottom.className = "project-bottom github-project-bottom";
    const meta = document.createElement("span");
    meta.textContent = (repo.language || "Multiple languages") + " · " + Number(repo.stargazers_count || 0) + " stars";
    const links = document.createElement("div");
    links.className = "github-project-links";
    const repositoryUrl = safeUrl(repo.html_url);
    if (repositoryUrl) links.append(makeLink(repositoryUrl, "Source code ↗", "github-repo-link"));
    const demoUrl = safeUrl(repo.homepage || "");
    if (demoUrl) links.append(makeLink(demoUrl, "Live application ↗", "github-demo-link"));
    bottom.append(meta, links);
    info.append(details, bottom);
    card.append(visual, info);
    return card;
  }

  function renderRepositories(repositories) {
    const byName = new Map(repositories.map((repo) => [repo.name, repo]));
    const selected = featuredOrder
      .map((name) => byName.get(name))
      .filter((repo) => repo && !repo.fork && !repo.archived);

    grid.replaceChildren();
    if (!selected.length) {
      const empty = document.createElement("p");
      empty.className = "github-project-placeholder";
      empty.textContent = "Selected project details are temporarily unavailable. Browse the source repositories on GitHub.";
      grid.append(empty);
    } else {
      selected.forEach((repo) => grid.append(createProjectCard(repo)));
    }
    setStatus("Showing " + selected.length + " selected projects. The full repository list remains on GitHub.");
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Array.isArray(cached.repositories)) return cached;
    } catch {
      // Browser storage may be unavailable.
    }
    return null;
  }

  async function loadRepositories() {
    const cached = readCache();
    if (cached && Date.now() - cached.savedAt < cacheTtlMs) {
      renderRepositories(cached.repositories);
      setStatus("Showing selected projects · checking GitHub for updates…");
    }

    try {
      const response = await fetch(
        "https://api.github.com/users/" + username + "/repos?type=owner&sort=updated&per_page=100",
        { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" }
      );
      if (!response.ok) throw new Error("GitHub API returned HTTP " + response.status);
      const repositories = await response.json();
      if (!Array.isArray(repositories)) throw new Error("Unexpected GitHub API response");

      try {
        localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), repositories }));
      } catch {
        // The portfolio remains usable without browser storage.
      }
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
