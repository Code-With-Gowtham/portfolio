
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

    // 2. Count public repositories across all pages
    let allRepos = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`
      );

      if (!response.ok) {
        throw new Error("Unable to load repository count.");
      }

      const repos = await response.json();
      allRepos.push(...repos);

      if (repos.length < 100) break;
      page++;
    }

    count.textContent = allRepos.filter(
      repo => repo.name !== excludeRepo
    ).length;

    // 3. Fetch pinned repositories from Netlify
    const pinnedResponse = await fetch(
      "/.netlify/functions/pinned-repos"
    );

    if (!pinnedResponse.ok) {
      throw new Error("Unable to load pinned repositories.");
    }

    const pinnedRepos = await pinnedResponse.json();

    // 4. Display only pinned repositories
    grid.replaceChildren();

    pinnedRepos.forEach(repo => {
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

    // 5. Show languages from pinned repositories
    if (skills) {
      skills.replaceChildren();

      const languages = [
        ...new Set(
          pinnedRepos
            .map(repo => repo.language)
            .filter(language => language !== "Not specified")
        )
      ];

      languages.forEach(language => {
        const tag = document.createElement("span");
        tag.textContent = language;
        skills.appendChild(tag);
      });
    }

    if (pinnedRepos.length === 0) {
      grid.textContent = "No pinned repositories found.";
    }

  } catch (error) {
    console.error(error);
    grid.textContent =
      "Could not load projects. Please try again later.";
  }
}

fetchGithub();
