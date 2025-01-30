const { Octokit } = require("@octokit/rest");
import simpleGit from "simple-git";  
import { prepareRepo } from "./repoService";

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
    //console.log("[DEBUG] PRs sin filtrar:", data);
    //return data.filter((pr: PullRequest) => pr.user?.login === user);
    return data;
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
    //console.log("[DEBUG] Issues sin filtrar:", data);
    //return data.filter((issue: Issue) => issue.user?.login === user);
    return data;
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
    //console.log("[DEBUG] Comentarios sin filtrar:", comments.data);
    //return comments.data.filter((comment: Comment) => comment.user?.login === user);
    return comments.data;
  } catch (error) {
    console.error("[ERROR] Al obtener comentarios:", error);
    return [];
  }
};
/**
 * Obtener todas las ramas del repositorio.
 */
const getRepoBranches = async (repoOwner: string, repoName: string): Promise<string[]> => {
  try {
    const cleanRepoName = repoName.replace(/\.git$/, ""); 

    const { data } = await octokit.repos.listBranches({
      owner: repoOwner,
      repo: cleanRepoName, 
    });

    const branches = data.map((branch: any) => branch.name);

    console.log("[DEBUG] Ramas obtenidas:", branches);

    return branches;
  } catch (error) {
    console.error("[ERROR] Al obtener ramas desde GitHub. Intentando localmente...");

    try {
      //   Obtener ramas localmente si GitHub falla
      const repoPath = await prepareRepo(`https://github.com/${repoOwner}/${repoName}.git`);
      const git = simpleGit(repoPath);
      const localBranches = (await git.branch()).all.map(b => b.replace("remotes/origin/", ""));

      console.log("[DEBUG] Ramas obtenidas localmente:", localBranches);

      return localBranches;
    } catch (localError) {
      console.error("[ERROR] No se pudieron obtener ramas localmente:", localError);
      return [];
    }
  }
};


export {
  getPullRequestsByUser,
  getIssuesByUser,
  getCommentsByUser,
  getRepoBranches
};