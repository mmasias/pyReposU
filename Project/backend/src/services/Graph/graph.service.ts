import simpleGit from 'simple-git';
import { Commit } from '../../models/Commit';
import { CommitFile } from '../../models/CommitFile';
import { User } from '../../models/User';
import { Repository } from '../../models/Repository';
import { CommitBranch } from '../../models/CommitBranch';
import { Branch } from '../../models/Branch';
import { CommitParent } from '../../models/CommitParent';
import { prepareRepo } from '../../utils/gitRepoUtils';
import { AppError } from '../../middleware/errorHandler';

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
  filePaths?: string[];
};

export const getRepoGraphService = async (repoUrl: string): Promise<CommitNode[]> => {
  try {
    const repo = await Repository.findOne({ where: { url: repoUrl } });
    if (!repo) {
      throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);
    }

    const repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);

    const commits = await Commit.findAll({
      where: { repositoryId: repo.id },
      include: [User],
      order: [['date', 'ASC']],
    });

    const commitIds = commits.map(c => c.id);
    const shaToId = new Map<string, number>();
    commits.forEach(c => shaToId.set(c.hash, c.id));

    // Limpiar relaciones padre-hijo previas
    await CommitParent.destroy({ where: { childId: commitIds } });

    // Generar relaciones padre-hijo
    for (const commit of commits) {
      const raw = await git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);
      const parts = raw.trim().split(' ');
      const parents = parts.slice(1);

      for (const parentSha of parents) {
        const parentId = shaToId.get(parentSha);
        const childId = shaToId.get(commit.hash);
        if (parentId && childId) {
          await CommitParent.findOrCreate({
            where: { parentId, childId },
          });
        }
      }
    }

    const [commitFiles, commitBranches, commitParents, branches] = await Promise.all([
      CommitFile.findAll({ where: { commitId: commitIds } }),
      CommitBranch.findAll({ where: { commitId: commitIds }, include: [Branch] }),
      CommitParent.findAll({ where: { childId: commitIds } }),
      Branch.findAll({ where: { repositoryId: repo.id } }),
    ]);

    const branchMap = new Map<number, string>();
    branches.forEach(b => branchMap.set(b.id, b.name));

    const commitToBranches: Record<number, string[]> = {};
    const commitToPrimaryBranch: Record<number, string> = {};

    for (const cb of commitBranches) {
      const branchName = branchMap.get(cb.branchId);
      if (!branchName) continue;

      if (!commitToBranches[cb.commitId]) commitToBranches[cb.commitId] = [];
      commitToBranches[cb.commitId].push(branchName);

      if (cb.isPrimary === true) {
        commitToPrimaryBranch[cb.commitId] = branchName;
      }
    }

    const commitToParents: Record<number, string[]> = {};
    for (const cp of commitParents) {
      if (!commitToParents[cp.childId]) commitToParents[cp.childId] = [];
      const parentCommit = commits.find(c => c.id === cp.parentId);
      if (parentCommit) commitToParents[cp.childId].push(parentCommit.hash);
    }

    const result: CommitNode[] = commits.map(commit => {
      const files = commitFiles.filter(f => f.commitId === commit.id);
      const filesChanged = files.length;
      const insertions = files.reduce((acc, f) => acc + (f.linesAdded || 0), 0);
      const deletions = files.reduce((acc, f) => acc + (f.linesDeleted || 0), 0);
      const filePaths = files.map(f => f.filePath);

      return {
        sha: commit.hash,
        message: commit.message || '',
        author: commit.User?.githubLogin || 'Desconocido',
        date: commit.date.toISOString(),
        parents: commitToParents[commit.id] || [],
        branches: commitToBranches[commit.id] || [],
        primaryBranch: commitToPrimaryBranch[commit.id] || null,
        filesChanged,
        insertions,
        deletions,
        filePaths,
      };
    });

    console.log('[GRAPH DEBUG] Ejemplo de commit node:');
    console.dir(result.find(c => c.branches.length > 1), { depth: null });

    return result;

  } catch (err) {
    console.error(`[getRepoGraphService] Error:`, err);
    throw new AppError("FAILED_TO_PROCESS_REPO_GRAPH");
  }
};
