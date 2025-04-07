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
  filesChanged: number;
  insertions: number;
  deletions: number;
};

export const getRepoGraphService = async (repoUrl: string): Promise<CommitNode[]> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  const commitsMap: Map<string, CommitNode> = new Map();

  //  Paso 1: Cargar TODOS los commits del repo
  const log = await git.log(['--all', '--date=iso']);

  for (const commit of log.all) {
    const rawParents = await git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);
    const parts = rawParents.trim().split(' ');
    const parents = parts.slice(1);

    const showStat = await git.raw(['show', '--shortstat', '--oneline', commit.hash]);
    const statLine = showStat.split('\n').find(line => line.includes('file'));

    let filesChanged = 0, insertions = 0, deletions = 0;
    if (statLine) {
      const regex = /(\d+)\sfiles? changed(, (\d+) insertions?\(\+\))?(, (\d+) deletions?\(-\))?/;
      const match = statLine.match(regex);
      if (match) {
        filesChanged = parseInt(match[1] || '0', 10);
        insertions = parseInt(match[3] || '0', 10);
        deletions = parseInt(match[5] || '0', 10);
      }
    }

    commitsMap.set(commit.hash, {
      sha: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: new Date(commit.date).toISOString(),
      parents,
      branches: [],
      primaryBranch: null,
      filesChanged,
      insertions,
      deletions,
    });
  }

  //  Paso 2: Recorrer ramas para asignar a qué rama pertenece cada commit
  const branchList = (await git.branch(['-r'])).all
    .map((b) => b.replace('origin/', '').trim())
    .filter((b) => b && !b.includes('HEAD'));

  for (const branch of branchList) {
    const log = await git.log({ from: `origin/${branch}` });

    for (const commit of log.all) {
      const existing = commitsMap.get(commit.hash);
      if (existing) {
        if (!existing.branches.includes(branch)) {
          existing.branches.push(branch);
        }
      }
    }
  }

// Paso 3: Asignar primaryBranch si hay ramas conocidas
for (const commit of commitsMap.values()) {
  try {
    const nameRevOutput = await git.raw(['name-rev', '--name-only', commit.sha]);
    const cleanBranchName = nameRevOutput.split('~')[0].trim();
    commit.primaryBranch = cleanBranchName;
  } catch (e) {
    commit.primaryBranch = commit.branches[0] || null;
  }
}


  return Array.from(commitsMap.values());
};
