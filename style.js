const username = "Code-With-Gowtham";
const excludeRepo = "Code-With-Gowtham"; // Change this to your portfolio repo name if different

async function fetchGithub() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();

    // Update UI (remove GitHub bio update)
    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("name").textContent = user.name || user.login;
    // document.getElementById("bio").textContent = user.bio || ""; // <-- Remove this line
    document.getElementById("resumeBtn").href = user.blog || user.html_url;

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated`
    );
    const repos = await reposRes.json();
    // Exclude forked repos and the portfolio repo itself
    const top6 = repos
      .filter((r) => !r.fork && r.name !== excludeRepo)
      .slice(0, 6);

    document.getElementById("projects-count").textContent = top6.length;
    const grid = document.getElementById("projects-list");
    grid.innerHTML = ""; // Clear previous content
    top6.forEach((repo) => {
      const div = document.createElement("div");
      div.className = "project-card";
      div.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || ""}</p>
        <a href="${repo.html_url}" target="_blank">View Repo</a>`;
      grid.appendChild(div);
    });

    // Aggregate topics from all top6 repos for tech stack
    const allTopics = new Set();
    await Promise.all(
      top6.map(async (repo) => {
        const topicsRes = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/topics`,
          {
            headers: { Accept: "application/vnd.github.mercy-preview+json" },
          }
        );
        const topicsData = await topicsRes.json();
        (topicsData.names || []).forEach((topic) => allTopics.add(topic));
      })
    );

    // Display tech stack
    const bar = document.getElementById("skills");
    bar.innerHTML = "";
    Array.from(allTopics)
      .slice(0, 10)
      .forEach((skill) => {
        const span = document.createElement("span");
        span.textContent = skill;
        bar.appendChild(span);
      });
  } catch (err) {
    console.error(err);
    document.getElementById("projects-list").innerHTML =
      "<p>Could not load projects. Check your GitHub username or network.</p>";
  }
}

fetchGithub();

document.querySelectorAll("section").forEach((section) => {
  const reveal = () => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add("visible");
      window.removeEventListener("scroll", reveal);
    }
  };
  window.addEventListener("scroll", reveal);
  reveal();
});
