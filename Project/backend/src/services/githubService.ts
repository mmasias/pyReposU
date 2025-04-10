import { 
  fetchPullRequestsByUser, 
  fetchIssuesByUser, 
  fetchCommentsByUser,  
} from "./githubApiService";

/**
 * Obtiene los Pull Requests en un repositorio.
 */
export const getPullRequestsByUser = async (repoOwner: string, repoName: string) => {
  return await fetchPullRequestsByUser(repoOwner, repoName); //  Quitamos el parámetro `user`
};

/**
 * Obtiene los Issues en un repositorio.
 */
export const getIssuesByUser = async (repoOwner: string, repoName: string) => {
  return await fetchIssuesByUser(repoOwner, repoName); //  Quitamos el parámetro `user`
};

/**
 * Obtiene los comentarios en PRs e Issues en un repositorio.
 */
export const getCommentsByUser = async (repoOwner: string, repoName: string) => {
  return await fetchCommentsByUser(repoOwner, repoName); //  Quitamos el parámetro `user`
};
