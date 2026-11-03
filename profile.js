document.addEventListener("DOMContentLoaded", () => {
  const profilePhoto = document.querySelector(".profile-photo");
  if (profilePhoto) profilePhoto.src = "images/aliasgar-lohawala.png";

  const grid = document.getElementById("github-projects");
  const status = document.getElementById("github-sync-status");
  if (!grid) return;

  const username = "HiiAliasgar";
  const cacheKey = "aliasgar_public_repositories_v1";
  const cacheTtlMs = 10 * 60 * 1000;
  const featuredOrder = [
    "Accident-Guard",
    "aliasgar-ai",
    "Rag_Application",
    "smart-study-assistant",
    "support-ticketing-crm"
  ];

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

  function formatDate(value) {
    if (!value) return "date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "date unavailable";
    return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(date);
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

  function createProjectCard(repo, index) {
    const card = document.createElement("article");
    card.className = "project" + (repo.name === "Accident-Guard" ? " featured" : "");

    const visual = document.createElement("div");
    visual.className = "project-visual github-project-visual";

    const visualLabel = document.createElement("span");
    visualLabel.className = "mono";
    visualLabel.textContent = "GITHUB REPOSITORY / " + String(index + 1).padStart(2, "0");

    const monogram = document.createElement("div");
    monogram.className = "github-project-monogram";
    monogram.textContent = (repo.name || "G").slice(0, 1).toUpperCase();

    const visualFooter = document.createElement("div");
    visualFooter.className = "github-project-visual-footer";
    visualFooter.textContent = repo.language || "Open-source project";

    visual.append(visualLabel, monogram, visualFooter);

    const info = document.createElement("div");
    info.className = "project-info";

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = (repo.name || "Untitled repository").replace(/[-_]/g, " ");
    const description = document.createElement("p");
    description.textContent = repo.description || "Public repository. A project description has not been added yet.";
    details.append(title, description);

    const bottom = document.createElement("div");
    bottom.className = "project-bottom github-project-bottom";

    const meta = document.createElement("span");
    const language = repo.language || "Multiple languages";
    const stars = Number(repo.stargazers_count || 0);
    meta.textContent = language + " · Updated " + formatDate(repo.pushed_at || repo.updated_at) + " · ★ " + stars;

    const links = document.createElement("div");
    links.className = "github-project-links";
    const repositoryUrl = safeUrl(repo.html_url);
    if (repositoryUrl) links.append(makeLink(repositoryUrl, "Repository ↗", "github-repo-link"));

    const demoUrl = safeUrl(repo.homepage || "");
    if (demoUrl) links.append(makeLink(demoUrl, "Live demo ↗", "github-demo-link"));

    bottom.append(meta, links);
    info.append(details, bottom);
    card.append(visual, info);
    return card;
  }

  function renderRepositories(repositories) {
    const priority = new Map(featuredOrder.map((name, index) => [name, index]));
    const visible = repositories
      .filter((repo) => !repo.fork && !repo.archived && repo.name !== "HiiAliasgar")
      .sort((a, b) => {
        const ai = priority.has(a.name) ? priority.get(a.name) : 999;
        const bi = priority.has(b.name) ? priority.get(b.name) : 999;
        if (ai !== bi) return ai - bi;
        return new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at);
      });

    grid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "github-project-placeholder";
      empty.textContent = "No public project repositories were found.";
      grid.append(empty);
    } else {
      visible.forEach((repo, index) => grid.append(createProjectCard(repo, index)));
    }
    setStatus("Synced " + visible.length + " public repositories from GitHub · refreshed " +
      new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Array.isArray(cached.repositories)) return cached;
    } catch {
      // Browser storage may be unavailable; the live request can still work.
    }
    return null;
  }

  async function loadRepositories() {
    const cached = readCache();
    if (cached && Date.now() - cached.savedAt < cacheTtlMs) {
      renderRepositories(cached.repositories);
      setStatus("Showing recently synced GitHub repositories · checking for updates…");
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
        // The portfolio remains usable if browser storage is disabled.
      }
      renderRepositories(repositories);
    } catch (error) {
      if (cached) {
        renderRepositories(cached.repositories);
        setStatus("Showing cached GitHub data; live refresh failed. Visit GitHub for the latest projects.");
      } else {
        grid.replaceChildren();
        const message = document.createElement("p");
        message.className = "github-project-placeholder";
        message.textContent = "The live project feed is temporarily unavailable. Use the GitHub link below to browse repositories.";
        grid.append(message);
        setStatus("Could not refresh projects from GitHub.");
      }
    }
  }

  loadRepositories();
});
