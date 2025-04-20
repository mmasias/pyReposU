import { Commit } from "../models/Commit";
import { CommitFile } from "../models/CommitFile";
import { normalizePath } from "../utils/file.utils";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";

export const getFoldersOrderedService = async (
  repoId: number,
  filters?: {
    author?: string;
    since?: Date;
    until?: Date;
    branch?: string;
    repoUrl?: string;
  }
): Promise<{ folder: string; changes: number }[]> => {
  const filesInHead = new Set<string>();
  if (filters?.repoUrl) {
    const repoPath = await prepareRepo(filters.repoUrl);
    const git = simpleGit(repoPath);
    if (filters.branch) {
      try {
        await git.checkout(filters.branch);
      } catch (err) {
        console.warn(`[getFoldersOrderedService] No se pudo hacer checkout a ${filters.branch}`, err);
      }
    }
    const output = await git.raw(["ls-files"]);
    output
      .split("\n")
      .map(normalizePath)
      .filter(Boolean)
      .forEach((p) => filesInHead.add(p));
  }

  const commits = await Commit.findAll({
    where: {
      repositoryId: repoId,
      ...(filters?.author && { '$User.githubLogin$': filters.author }),
      ...(filters?.since && { date: { gte: filters.since } }),
      ...(filters?.until && { date: { lte: filters.until } }),
    },
    include: ['User'],
  });

  const commitIds = commits.map(c => c.id);
  const files = await CommitFile.findAll({ where: { commitId: commitIds } });

  const folderStats: Record<string, number> = {};

  for (const file of files) {
    const path = normalizePath(file.filePath);
    if (filesInHead.size === 0 || filesInHead.has(path)) {
      const folder = path.split('/')[0];
      folderStats[folder] = (folderStats[folder] || 0) + 1;
    }
  }

  return Object.entries(folderStats)
    .sort((a, b) => b[1] - a[1])
    .map(([folder, changes]) => ({ folder, changes }));
};
