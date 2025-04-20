import { Commit } from "../models/Commit";
import { CommitFile } from "../models/CommitFile";
import { normalizePath } from "../utils/file.utils";

export const getFolderStatsService = async (repoId: number): Promise<Record<string, {
  totalChanges: number;
  files: Record<string, number>;
}>> => {
  const commits = await Commit.findAll({ where: { repositoryId: repoId } });
  const commitIds = commits.map(c => c.id);
  const files = await CommitFile.findAll({ where: { commitId: commitIds } });

  const folderStats: Record<string, {
    totalChanges: number;
    files: Record<string, number>;
  }> = {};

  for (const file of files) {
    const normalized = normalizePath(file.filePath);
    const folder = normalized.split('/')[0];

    if (!folderStats[folder]) {
      folderStats[folder] = { totalChanges: 0, files: {} };
    }

    folderStats[folder].totalChanges += 1;
    folderStats[folder].files[normalized] = (folderStats[folder].files[normalized] || 0) + 1;
  }

  return folderStats;
};
