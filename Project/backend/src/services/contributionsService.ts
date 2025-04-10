import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Op } from 'sequelize';

interface ContributionStats {
  [path: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

export const getContributionsByUser = async (
  repoUrl: string,
  branch: string = 'main', // por ahora ignorado hasta que branches estén en BBDD
  startDate?: string,
  endDate?: string
): Promise<ContributionStats> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const commitWhere: any = { repositoryId: repo.id };
  if (startDate) commitWhere.date = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    commitWhere.date = commitWhere.date
      ? { ...commitWhere.date, [Op.lte]: new Date(endDate) }
      : { [Op.lte]: new Date(endDate) };
  }

  const commits = await Commit.findAll({
    where: commitWhere,
    include: [User],
  });

  const commitIds = commits.map((c) => c.id);
  const files = await CommitFile.findAll({
    where: { commitId: commitIds },
  });

  const contributions: ContributionStats = {};

  for (const commit of commits) {
    const login = (commit as any).User?.githubLogin || 'Desconocido';

    const commitFiles = files.filter((f) => f.commitId === commit.id);
    for (const file of commitFiles) {
      const filePath = file.filePath;
      const linesAdded = file.linesAdded || 0;
      const linesDeleted = file.linesDeleted || 0;
      const total = linesAdded + linesDeleted;

      if (!contributions[filePath]) contributions[filePath] = {};
      if (!contributions[filePath][login]) {
        contributions[filePath][login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 0,
        };
      }

      contributions[filePath][login].linesAdded += linesAdded;
      contributions[filePath][login].linesDeleted += linesDeleted;
      contributions[filePath][login].percentage += total;
    }
  }

  // Calcular % por archivo
  for (const filePath of Object.keys(contributions)) {
    const totalMod = Object.values(contributions[filePath])
      .reduce((sum, val) => sum + val.percentage, 0);

    if (totalMod > 0) {
      for (const user of Object.keys(contributions[filePath])) {
        contributions[filePath][user].percentage =
          (contributions[filePath][user].percentage / totalMod) * 100;
      }
    }
  }

  // Agrupar por carpetas
  const folderContributions: ContributionStats = {};

  for (const filePath of Object.keys(contributions)) {
    const parts = filePath.split('/');
    for (let i = 1; i < parts.length; i++) {
      const folder = parts.slice(0, i).join('/');

      if (!folderContributions[folder]) folderContributions[folder] = {};

      for (const [user, stats] of Object.entries(contributions[filePath])) {
        if (!folderContributions[folder][user]) {
          folderContributions[folder][user] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
        }
        folderContributions[folder][user].linesAdded += stats.linesAdded;
        folderContributions[folder][user].linesDeleted += stats.linesDeleted;
        folderContributions[folder][user].percentage += stats.percentage;
      }
    }
  }

  // Normalizar %
  for (const folder of Object.keys(folderContributions)) {
    const totalPercentage = Object.values(folderContributions[folder])
      .reduce((sum, { percentage }) => sum + percentage, 0);

    if (totalPercentage > 100) {
      for (const user of Object.keys(folderContributions[folder])) {
        folderContributions[folder][user].percentage =
          (folderContributions[folder][user].percentage / totalPercentage) * 100;
      }
    }
  }

  Object.assign(contributions, folderContributions);

  // Calcular total global
  const userTotals: Record<string, number> = {};
  for (const path of Object.keys(contributions)) {
    for (const user of Object.keys(contributions[path])) {
      userTotals[user] = (userTotals[user] || 0) + contributions[path][user].percentage;
    }
  }

  const totalSum = Object.values(userTotals).reduce((sum, val) => sum + val, 0);
  if (totalSum > 0) {
    for (const user of Object.keys(userTotals)) {
      userTotals[user] = (userTotals[user] / totalSum) * 100;
    }
  }

  contributions['TOTAL'] = {};
  for (const user of Object.keys(userTotals)) {
    contributions['TOTAL'][user] = {
      linesAdded: 0,
      linesDeleted: 0,
      percentage: userTotals[user],
    };
  }

  return contributions;
};
