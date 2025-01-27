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
  const { data } = await octokit.pulls.list({
    owner: repoOwner,
    repo: repoName,
    state: "all",
  });

  return data.filter((pr: PullRequest) => pr.user?.login === user);
};

/**
 * Obtener Issues creados por un usuario en un repositorio.
 */
const getIssuesByUser = async (
  repoOwner: string,
  repoName: string,
  user: string
): Promise<Issue[]> => {
  const { data } = await octokit.issues.listForRepo({
    owner: repoOwner,
    repo: repoName,
    state: "all",
  });

  return data.filter((issue: Issue) => issue.user?.login === user);
};

/**
 * Obtener comentarios realizados por un usuario en PRs o Issues.
 */
const getCommentsByUser = async (
  repoOwner: string,
  repoName: string,
  user: string
): Promise<Comment[]> => {
  const comments = await octokit.issues.listCommentsForRepo({
    owner: repoOwner,
    repo: repoName,
  });

  return comments.data.filter((comment: Comment) => comment.user?.login === user);
};

module.exports = {
  getPullRequestsByUser,
  getIssuesByUser,
  getCommentsByUser,
};
