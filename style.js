
const username = "Code-With-Gowtham";
const excludeRepo = "Code-With-Gowtham";

async function fetchGithub() {
  const grid = document.getElementById("projects-list");
  const count = document.getElementById("projects-count");
  const skills = document.getElementById("skills");

  try {
    // 1. Load profile details
    const profileResponse = await fetch(
      `https://api.github.com/users/${username}`
    );

    if (!profileResponse.ok) {
      throw new Error("Unable to load GitHub profile.");
    }

    const user = await profileResponse.json();

    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("name").textContent =
      user.name || user.login;

    // 2. Load public repositories for the project count and static-host fallback
    let allRepos = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
      );

      if (!response.ok) {
        throw new Error("Unable to load repository count.");
      }

      const repos = await response.json();
      allRepos.push(...repos);

      if (repos.length < 100) break;
      page++;
    }

    const publicRepos = allRepos.filter(
      repo => !repo.fork && repo.name !== excludeRepo
    );
    count.textContent = publicRepos.length;

    // Pinned repositories require the Netlify function; use public repos on static hosts.
    let projects;
    try {
      const pinnedResponse = await fetch("/.netlify/functions/pinned-repos");

      if (!pinnedResponse.ok) {
        throw new Error(`Pinned repositories returned ${pinnedResponse.status}.`);
      }

      const pinnedRepos = await pinnedResponse.json();
      if (!Array.isArray(pinnedRepos)) {
        throw new Error("Pinned repositories response is invalid.");
      }
      projects = pinnedRepos;
    } catch (error) {
      console.warn("Pinned repositories unavailable; showing public repositories instead.", error);
      projects = publicRepos.slice(0, 6).map(repo => ({
        name: repo.name,
        description: repo.description || "Explore this project.",
        html_url: repo.html_url,
        language: repo.language || "Not specified"
      }));
    }

    // 3. Display pinned repositories or the static-host fallback
    grid.replaceChildren();

    projects.forEach(repo => {
      const card = document.createElement("div");
      card.className = "project-card";

      const title = document.createElement("h3");
      title.textContent = repo.name;

      const description = document.createElement("p");
      description.textContent = repo.description;

      const language = document.createElement("span");
      language.className = "project-language";
      language.textContent = repo.language;

      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View Repository";

      card.append(title, description, language, link);
      grid.appendChild(card);
    });

    // 4. Show languages from the displayed projects
    if (skills) {
      skills.replaceChildren();

      const languages = [
        ...new Set(
          projects
            .map(repo => repo.language)
            .filter(language => language && language !== "Not specified")
        )
      ];

      languages.forEach(language => {
        const tag = document.createElement("span");
        tag.textContent = language;
        skills.appendChild(tag);
      });
    }

    if (projects.length === 0) {
      grid.textContent = "No pinned repositories found.";
    }

  } catch (error) {
    console.error(error);
    grid.textContent =
      "Could not load projects. Please try again later.";
  }
}

fetchGithub();

const sections = document.querySelectorAll("section");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -100px 0px" }
  );

  sections.forEach(section => sectionObserver.observe(section));
} else {
  sections.forEach(section => section.classList.add("visible"));
}
