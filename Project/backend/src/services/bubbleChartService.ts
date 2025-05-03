import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Op, Sequelize } from 'sequelize';

interface BubbleChartData {
  [user: string]: {
    date: string;
    linesAdded: number;
    linesDeleted: number;
    branch: string;
    hash: string;
    message: string;
    files: string[];
  }[];
}

export const getBubbleChartData = async (
  repoUrl: string,
  branch: string = 'main'
): Promise<BubbleChartData> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  // Si decides más adelante guardar branch info, aquí se filtra
  const commits = await Commit.findAll({
    where: {
      repositoryId: repo.id,
      ...(branch !== "all" ? {
        id: {
          [Op.in]: [
            // subconsulta para IDs de commits de esa rama:
            Sequelize.literal(`(
              SELECT "commitId"
              FROM commit_branch
              INNER JOIN branches ON commit_branch."branchId" = branches."id"
              WHERE branches."name" = '${branch}'
                AND branches."repositoryId" = ${repo.id}
            )`)
            
          ],
        },
      } : {}),
    },
    include: [User],
    order: [["date", "ASC"]],
  });
  

  const commitIds = commits.map((c) => c.id);
  const commitFiles = await CommitFile.findAll({
    where: { commitId: { [Op.in]: commitIds } },
  });

  const bubbleData: BubbleChartData = {};

  for (const commit of commits) {
    const author = (commit as any).User?.githubLogin || 'Desconocido';
    if (!bubbleData[author]) bubbleData[author] = [];

    const files = commitFiles
      .filter((f) => f.commitId === commit.id)
      .map((f) => f.filePath);

    const added = commitFiles
      .filter((f) => f.commitId === commit.id)
      .reduce((sum, f) => sum + (f.linesAdded || 0), 0);

    const deleted = commitFiles
      .filter((f) => f.commitId === commit.id)
      .reduce((sum, f) => sum + (f.linesDeleted || 0), 0);

    bubbleData[author].push({
      date: commit.date.toISOString(),
      linesAdded: added,
      linesDeleted: deleted,
      branch: branch, // placeholder — puedes hacerlo real si guardas ramas
      hash: commit.hash,
      message: commit.message || 'Sin mensaje',
      files,
    });
  }

  return bubbleData;
};
