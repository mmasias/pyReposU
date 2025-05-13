import { Repository, Commit } from '../models';
import { generateFileDiff } from '../utils/diffUtils';
import { ensureCommitFileContentAndDiff } from './fileAnalysisService';

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

  for (let i = 0; i < commitsFromBranch.length; i++) {
    const commit = commitsFromBranch[i];
    const prevCommit = commitsFromBranch[i - 1];

    const commitFile = await ensureCommitFileContentAndDiff(
      repoUrl,
      commit.hash,
      filePath,
      prevCommit?.hash
    );

    const content = commitFile.content!;
    const diff = prevContent ? generateFileDiff(prevContent, content) : undefined;
    prevContent = content;

    results.push({
      commitHash: commit.hash,
      content,
      date: commit.date.toISOString(),
      diffWithPrev: diff,
    });
  }

  return results;
};
