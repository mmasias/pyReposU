// services/filePlayback.service.ts

import { Repository, Commit, CommitFile } from '../models';
import { getFileContent } from '../utils/gitRepoUtils';
import { generateFileDiff } from '../utils/diffUtils';

export const getPlaybackHistory = async (
  repoUrl: string,
  branch: string,
  filePath: string
): Promise<
  {
    commitHash: string;
    content: string;
    date: string;
    diffWithPrev?: string;
  }[]
> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error("Repositorio no encontrado.");

  const commitsFromBranch = await Commit.findAll({
    include: [
      {
        association: Commit.associations.CommitFiles,
        where: { filePath },
        required: true,
      },
      {
        association: Commit.associations.CommitBranches,
        where: {},
        include: [
          {
            association: 'branch',
            where: { name: branch },
          },
        ],
      },
    ],
    where: { repositoryId: repo.id },
    order: [['date', 'ASC']],
  });

  const results: {
    commitHash: string;
    content: string;
    date: string;
    diffWithPrev?: string;
  }[] = [];

  let prevContent: string | null = null;

  for (const commit of commitsFromBranch) {
    const [commitFile] = await CommitFile.findOrCreate({
      where: {
        commitId: commit.id,
        filePath,
      },
      defaults: {
        linesAdded: 0,
        linesDeleted: 0,
        diff: '',
        content: '',
      },
    });

    // Si no tenemos contenido cacheado aún, lo obtenemos del repo
    if (!commitFile.content) {
      const newContent = await getFileContent(repoUrl, commit.hash, filePath);
      commitFile.content = newContent;
      await commitFile.save();
    }

    let diff = undefined;
    if (prevContent !== null) {
      diff = generateFileDiff(prevContent, commitFile.content!);
    }
    prevContent = commitFile.content!;

    results.push({
      commitHash: commit.hash,
      content: commitFile.content!,
      date: commit.date.toISOString(),
      diffWithPrev: diff,
    });
  }

  return results;
};
