import simpleGit from "simple-git";
import { prepareRepo } from "../../utils/gitUtils";  
import { 
  fetchPullRequestsByUser, 
  fetchIssuesByUser, 
  fetchCommentsByUser, 
  fetchBranches 
} from "./githubApiService";

/**
 * Obtiene todas las ramas de un repositorio.
 * Intenta primero desde GitHub y, si falla, lo intenta localmente.
 */
export const getRepoBranches = async (repoOwner: string, repoName: string) => {
  try {
    const branches = await fetchBranches(repoOwner, repoName);
    if (branches.length > 0) return branches;

    // Si GitHub falla, intentamos obtenerlas localmente
    console.warn("[GitHub Service] Intentando obtener ramas localmente...");
    const repoPath = await prepareRepo(`https://github.com/${repoOwner}/${repoName}.git`);
    const git = simpleGit(repoPath);
    return (await git.branch()).all.map((b) => b.replace("remotes/origin/", ""));
  } catch (error) {
    console.error("[GitHub Service] No se pudieron obtener ramas:", error);
    return [];
  }
};

/**
 * Obtiene los Pull Requests de un usuario en un repositorio.
 */
export const getPullRequestsByUser = async (repoOwner: string, repoName: string, user: string) => {
  return await fetchPullRequestsByUser(repoOwner, repoName, user);
};

/**
 * Obtiene los Issues de un usuario en un repositorio.
 */
export const getIssuesByUser = async (repoOwner: string, repoName: string, user: string) => {
  return await fetchIssuesByUser(repoOwner, repoName, user);
};

/**
 * Obtiene los comentarios en PRs e Issues de un usuario en un repositorio.
 */
export const getCommentsByUser = async (repoOwner: string, repoName: string, user: string) => {
  return await fetchCommentsByUser(repoOwner, repoName, user);
};
