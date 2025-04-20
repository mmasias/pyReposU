import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Branch } from '../models/Branch';
import { CommitBranch } from '../models/CommitBranch';
import { Op } from 'sequelize';
import { normalizePath } from "../utils/file.utils";
import { syncRepoIfNeeded } from './syncService';
import {getCurrentFilesFromBranch} from '../utils/gitRepoUtils';  
interface ContributionStats {
  [path: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

export const getContributionsByUser = async (
  repoUrl: string,
  branch: string = 'main',
  startDate?: string,
  endDate?: string
): Promise<ContributionStats> => {
  //  1. Sincroniza con flags correctos (solo lo necesario)
  await syncRepoIfNeeded(repoUrl, {
    syncCommits: true,
    syncDiffs: false,
    syncStats: true,
    syncGithubActivityOption: false,
  });

  //2 Recupera repo después de la sync (importante si antes no existía)
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);


  //  3. IMPORTANTE: Esperamos a que la rama exista (puede tardar tras sync)
  let branchRecord = await Branch.findOne({
    where: { name: branch, repositoryId: repo.id }
  });

  //  Espera pasiva si no existe aún (pequeño delay para evitar race condition)
  let retries = 0;
  while (!branchRecord && retries < 5) {
    await new Promise(res => setTimeout(res, 500));
    branchRecord = await Branch.findOne({ where: { name: branch, repositoryId: repo.id } });
    retries++;
  }

  if (!branchRecord) {
    throw new Error(`Rama no encontrada después de sincronización: ${branch}`);
  }

  const commitBranchLinks = await CommitBranch.findAll({
    where: { branchId: branchRecord.id }
  });
  const commitIds = commitBranchLinks.map(cb => cb.commitId);

  const commitWhere: any = {
    id: commitIds,
    repositoryId: repo.id
  };
  if (startDate) commitWhere.date = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    commitWhere.date = commitWhere.date
      ? { ...commitWhere.date, [Op.lte]: new Date(endDate) }
      : { [Op.lte]: new Date(endDate) };
  }

  const commits = await Commit.findAll({
    where: commitWhere,
    include: [User]
  });

  const filteredCommitIds = commits.map((c) => c.id);
  const files = await CommitFile.findAll({
    where: { commitId: filteredCommitIds }
  });

  const currentFilesSet = new Set<string>(
    (await getCurrentFilesFromBranch(repoUrl, branch)).map(normalizePath)
  );

  const contributions: ContributionStats = {};

  for (const commit of commits) {
    const login = (commit as any).User?.githubLogin || 'Desconocido';
    const commitFiles = files.filter((f) => f.commitId === commit.id);

    for (const file of commitFiles) {
      let filePath = normalizePath(file.filePath);
      filePath = filePath.replace(/\{.*=>\s*(.*?)\}/, '$1');
      filePath = filePath.replace(/^"(.*)"$/, '$1');

      if (!currentFilesSet.has(filePath)) continue;

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

  //  Porcentaje por archivo
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

  //  Agrupar por carpetas
  const folderContributions: ContributionStats = {};

  for (const filePath of Object.keys(contributions)) {
    const parts = filePath.split('/').filter(Boolean);
    for (let i = 1; i < parts.length; i++) {
      const folder = normalizePath(parts.slice(0, i).join('/'));

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

  //  Normalizar porcentaje en carpetas
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

  //  TOTAL
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

