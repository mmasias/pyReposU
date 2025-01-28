const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, 
});

interface PullRequest {
  user: {
    login: string;
  } | null;
}

interface Issue {
  user: {
    login: string;
  } | null;
}

interface Comment {
  user: {
    login: string;
  } | null;
}

/**
 * Obtener PRs creados por un usuario en un repositorio.
 */
const getPullRequestsByUser = async (
  repoOwner: string,
  repoName: string,
  user: string
): Promise<PullRequest[]> => {
  try {
    const { data } = await octokit.pulls.list({
      owner: repoOwner,
      repo: repoName,
      state: "all",
    });
    console.log("[DEBUG] PRs sin filtrar:", data);
    return data.filter((pr: PullRequest) => pr.user?.login === user);
  } catch (error) {
    console.error("[ERROR] Al obtener PRs:", error);
    return [];
  }
};


/**
 * Obtener Issues creados por un usuario en un repositorio.
 */
const getIssuesByUser = async (
  repoOwner: string,
  repoName: string,
  user: string
): Promise<Issue[]> => {
  try {
    const { data } = await octokit.issues.listForRepo({
      owner: repoOwner,
      repo: repoName,
      state: "all",
    });
    console.log("[DEBUG] Issues sin filtrar:", data);
    return data.filter((issue: Issue) => issue.user?.login === user);
  } catch (error) {
    console.error("[ERROR] Al obtener issues:", error);
    return [];
  }
};



/**
 * Obtener comentarios realizados por un usuario en PRs o Issues.
 */
const getCommentsByUser = async (
  repoOwner: string,
  repoName: string,
  user: string
): Promise<Comment[]> => {
  try {
    const comments = await octokit.issues.listCommentsForRepo({
      owner: repoOwner,
      repo: repoName,
    });
    console.log("[DEBUG] Comentarios sin filtrar:", comments.data);
    return comments.data.filter((comment: Comment) => comment.user?.login === user);
  } catch (error) {
    console.error("[ERROR] Al obtener comentarios:", error);
    return [];
  }
};


export {
  getPullRequestsByUser,
  getIssuesByUser,
  getCommentsByUser,
};