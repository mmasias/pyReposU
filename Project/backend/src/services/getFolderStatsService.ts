import { CommitFile } from "../models/CommitFile";
import { normalizePath } from "../utils/file.utils";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";

/**
 * Devuelve estadísticas de carpetas del estado actual del repo (HEAD).
 * Considera solo archivos vivos en HEAD.
 */
export const getFolderStatsService = async (
  repoId: number,
  repoUrl: string
): Promise<Record<
  string,
  {
    totalChanges: number;
    files: Record<string, number>;
  }
>> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  // 🧠 1. Obtener archivos vivos en HEAD
  const output = await git.raw(["ls-files"]);
  const filesInHead = new Set(
    output
      .split("\n")
      .map(normalizePath)
      .filter(Boolean)
  );

  // 🧠 2. Buscar archivos con cambios (solo los del repo)
  const files = await CommitFile.findAll({
    include: [{
      association: 'commit',
      where: { repositoryId: repoId },
      attributes: ['id'],
    }],
    attributes: ['filePath', 'linesAdded', 'linesDeleted'],
  });

  const folderStats: Record<
    string,
    {
      totalChanges: number;
      files: Record<string, number>;
    }
  > = {};

  for (const file of files) {
    const path = normalizePath(file.filePath);
    if (!filesInHead.has(path)) continue; 

    const folder = path.split("/")[0];
    const changes = (file.linesAdded || 0) + (file.linesDeleted || 0);

    if (!folderStats[folder]) {
      folderStats[folder] = { totalChanges: 0, files: {} };
    }

    folderStats[folder].totalChanges += changes;
    folderStats[folder].files[path] = (folderStats[folder].files[path] || 0) + changes;
  }

  return folderStats;
};
