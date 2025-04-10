import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';

type CommitNode = {
  sha: string;
  message: string;
  author: string;
  date: string;
  parents: string[]; // <- vacío si no hay relaciones aún
  branches: string[]; // <- vacías hasta que modeles CommitBranch
  primaryBranch: string | null; // <- null por ahora
  filesChanged: number;
  insertions: number;
  deletions: number;
};

export const getRepoGraphService = async (repoUrl: string): Promise<CommitNode[]> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const commits = await Commit.findAll({
    where: { repositoryId: repo.id },
    include: [User],
    order: [['date', 'ASC']],
  });

  const commitIds = commits.map((c) => c.id);
  const commitFiles = await CommitFile.findAll({
    where: { commitId: commitIds },
  });

  const result: CommitNode[] = commits.map((commit) => {
    const files = commitFiles.filter((f) => f.commitId === commit.id);

    const filesChanged = files.length;
    const insertions = files.reduce((acc, f) => acc + (f.linesAdded || 0), 0);
    const deletions = files.reduce((acc, f) => acc + (f.linesDeleted || 0), 0);

    return {
      sha: commit.hash,
      message: commit.message || '',
      author: (commit as any).User?.githubLogin || 'Desconocido',
      date: commit.date.toISOString(),
      parents: [], // <- si luego lo añades a modelo, se rellena
      branches: [], // <- si añades CommitBranch, se rellena
      primaryBranch: null, // <- si quieres priorizar una rama, lo añadimos
      filesChanged,
      insertions,
      deletions,
    };
  });

  return result;
};
