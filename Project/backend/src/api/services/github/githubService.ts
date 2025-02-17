import { 
  fetchPullRequestsByUser, 
  fetchIssuesByUser, 
  fetchCommentsByUser,  
} from "./githubApiService";


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
