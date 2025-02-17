import { Octokit } from "@octokit/rest";
import { config } from "../../../config/config";

const octokit = new Octokit({
  auth: config.github.token,
});

/**
 * Obtiene los Pull Requests de un usuario en un repositorio.
 */
export const fetchPullRequestsByUser = async (repoOwner: string, repoName: string, user: string) => {
  try {
    const { data } = await octokit.pulls.list({
      owner: repoOwner,
      repo: repoName,
      state: "all",
    });

    return data.filter((pr) => pr.user?.login === user);
  } catch (error) {
    console.error("[GitHub API] Error al obtener PRs:", error);
    return [];
  }
};

/**
 * Obtiene los Issues de un usuario en un repositorio.
 */
export const fetchIssuesByUser = async (repoOwner: string, repoName: string, user: string) => {
  try {
    const { data } = await octokit.issues.listForRepo({
      owner: repoOwner,
      repo: repoName,
      state: "all",
    });

    return data.filter((issue) => issue.user?.login === user);
  } catch (error) {
    console.error("[GitHub API] Error al obtener Issues:", error);
    return [];
  }
};

/**
 * Obtiene los comentarios en PRs e Issues de un usuario en un repositorio.
 */
export const fetchCommentsByUser = async (repoOwner: string, repoName: string, user: string) => {
  try {
    const { data } = await octokit.issues.listCommentsForRepo({
      owner: repoOwner,
      repo: repoName,
    });

    return data.filter((comment) => comment.user?.login === user);
  } catch (error) {
    console.error("[GitHub API] Error al obtener comentarios:", error);
    return [];
  }
};


/**
 * Obtiene todas las ramas de un repositorio desde la API de GitHub.
 */
export const fetchBranches = async (repoOwner: string, repoName: string) => {
    try {
      const { data } = await octokit.repos.listBranches({
        owner: repoOwner,
        repo: repoName.replace(/\.git$/, ""), // Limpia el nombre del repo si tiene ".git"
      });
  
      return data.map((branch) => branch.name);
    } catch (error) {
      console.error("[GitHub API] Error al obtener ramas:", error);
      return [];
    }
  };
  