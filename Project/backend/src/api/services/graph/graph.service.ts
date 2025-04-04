import simpleGit from 'simple-git';
import { prepareRepo } from '../../utils/gitRepoUtils';

type CommitNode = {
  sha: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  branches: string[];
  primaryBranch: string | null;
};

export const getRepoGraphService = async (repoUrl: string): Promise<CommitNode[]> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  // 1. Obtener todas las ramas remotas
  const branchList = (await git.branch(['-r'])).all
    .map((b) => b.replace('origin/', '').trim())
    .filter((b) => b && !b.includes('HEAD'));

  const commitsMap: Map<string, CommitNode> = new Map();

  for (const branch of branchList) {
    const log = await git.log({ from: `origin/${branch}` });

    for (const commit of log.all) {
      if (!commitsMap.has(commit.hash)) {
        const rawParents = await git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);
        const parts = rawParents.trim().split(' ');
        const parents = parts.slice(1); // el primero es el hash mismo

        commitsMap.set(commit.hash, {
          sha: commit.hash,
          message: commit.message,
          author: commit.author_name,
          date: new Date(commit.date).toISOString(),
          parents,
          branches: [branch],
          primaryBranch: branch
        });
      } else {
        const existing = commitsMap.get(commit.hash)!;
        if (!existing.branches.includes(branch)) {
          existing.branches.push(branch);
        }
      }
    }
  }

  // Inferir rama principal por heurística simple
  for (const commit of commitsMap.values()) {
    commit.primaryBranch = commit.branches[0] || null;
  }

  return Array.from(commitsMap.values());
};
