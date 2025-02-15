import { GitRepositoryService } from "./gitService/GitRepositoryService";

/**
 * Obtiene los commits de un repositorio Git.
 * @param repoUrl URL del repositorio.
 */
export const getCommitsService = async (repoUrl: string) => {
  const gitService = new GitRepositoryService(repoUrl);
  await gitService.init();
  const commits = await gitService.getCommits();
  await gitService.cleanup();
  return commits;
};
