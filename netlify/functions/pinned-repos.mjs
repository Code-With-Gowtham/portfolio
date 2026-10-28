
export default async function handler() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return Response.json(
      { error: "GitHub token is not configured." },
      { status: 500 }
    );
  }

  const query = `
    query {
      user(login: "Code-With-Gowtham") {
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            ... on Repository {
              name
              description
              url
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      "https://api.github.com/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      }
    );

    const result = await response.json();

    if (!response.ok || result.errors) {
      console.error("GitHub API error:", result.errors);
      return Response.json(
        { error: "Unable to fetch pinned repositories." },
        { status: 502 }
      );
    }

    const user = result.data?.user;

    if (!user) {
      return Response.json(
        { error: "GitHub user not found." },
        { status: 404 }
      );
    }

    const repos = user.pinnedItems.nodes.map(repo => ({
      name: repo.name,
      description: repo.description || "Explore this project.",
      html_url: repo.url,
      language: repo.primaryLanguage?.name || "Not specified"
    }));

    return Response.json(repos, {
      headers: {
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (error) {
    console.error("Pinned repository error:", error.message);

    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
