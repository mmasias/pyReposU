import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Branch } from '../models/Branch';
import { CommitBranch } from '../models/CommitBranch';
import { Op } from 'sequelize';
import { normalizePath } from "../utils/file.utils";
import {getCurrentFilesFromBranch} from '../utils/gitRepoUtils';  
import { BranchStats } from '../models/BranchStats';
import { getLastLocalCommitHash } from '../utils/gitRepoUtils';

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
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const branchRecord = await Branch.findOne({
    where: { name: branch, repositoryId: repo.id }
  });
  const latestHash = await getLastLocalCommitHash(repoUrl, branch);

if (!branchRecord) throw new Error(`Rama no encontrada en DB: ${branch}`);
const existingStats = await BranchStats.findOne({ where: { branchId: branchRecord.id } });

//Si ya esta cacheado lo trae de bbdd
if (existingStats && existingStats.lastCommitHash === latestHash) {
  console.log('✅ Stats cacheadas. Cargando desde BBDD');
  return await generateStatsFromDB(repo.id, branchRecord.id);
} else {
  console.log('🧠 Stats desactualizadas. Recalculando...');
  // Esto ya lo haces implícitamente más abajo al cargar todo desde Commit + CommitFile

  await BranchStats.upsert({
    branchId: branchRecord?.id,
    lastCommitHash: latestHash,
  });
}
  if (!branchRecord) throw new Error(`Rama no encontrada en DB: ${branch}`);

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

  const filteredCommitIds = commits.map(c => c.id);
  const files = await CommitFile.findAll({
    where: { commitId: filteredCommitIds }
  });

  const currentFiles = new Set<string>(
    (await getCurrentFilesFromBranch(repoUrl, branch)).map(normalizePath)
  );

  const contributions: ContributionStats = {};

  // Inicializa todos los archivos visibles con 0s aunque no tengan contribuciones
  for (const filePath of currentFiles) {
    contributions[filePath] = {};
  }

  for (const commit of commits) {
    const login = (commit as any).User?.githubLogin || 'Desconocido';
    const commitFiles = files.filter(f => f.commitId === commit.id);

    for (const file of commitFiles) {
      let filePath = normalizePath(file.filePath);
      filePath = filePath.replace(/\{.*=>\s*(.*?)\}/, '$1');
      filePath = filePath.replace(/^"(.*)"$/, '$1');

      if (!currentFiles.has(filePath)) continue;

      if (!contributions[filePath]) contributions[filePath] = {};
      if (!contributions[filePath][login]) {
        contributions[filePath][login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 0
        };
      }

      contributions[filePath][login].linesAdded += file.linesAdded || 0;
      contributions[filePath][login].linesDeleted += file.linesDeleted || 0;
    }
  }

  // Calcula porcentajes por archivo
  for (const filePath in contributions) {
    const stats = contributions[filePath];
    let total = Object.values(stats).reduce((acc, cur) => acc + cur.linesAdded + cur.linesDeleted, 0);

    //  Si es un archivo sin líneas contadas, pero alguien lo subió, asignamos autoría completa
    if (total === 0 && Object.keys(stats).length === 1) {
      total = 1; // le damos "peso" artificial
    }
    
    for (const user in stats) {
      const userTotal = stats[user].linesAdded + stats[user].linesDeleted;
      stats[user].percentage = total > 0 ? (userTotal / total) * 100 : 100;
    }
    
  }
  
  
  // Agrupa en carpetas
  const folderContributions: ContributionStats = {};
  for (const filePath in contributions) {
    const parts = filePath.split('/');
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

  // Calcula porcentajes de carpetas
  for (const folder of Object.keys(folderContributions)) {
    const total = Object.values(folderContributions[folder]).reduce((s, val) => s + val.percentage, 0);
    if (total > 0) {
      for (const user of Object.keys(folderContributions[folder])) {
        folderContributions[folder][user].percentage =
          (folderContributions[folder][user].percentage / total) * 100;
      }
    }
  }

  // Mezcla sin sobrescribir archivos
  for (const key of Object.keys(folderContributions)) {
    if (!contributions[key]) contributions[key] = folderContributions[key];
  }

  // TOTAL general
  const userTotals: Record<string, number> = {};
  for (const path of Object.keys(contributions)) {
    for (const user of Object.keys(contributions[path])) {
      userTotals[user] = (userTotals[user] || 0) + contributions[path][user].percentage;
    }
  }

  const totalSum = Object.values(userTotals).reduce((sum, val) => sum + val, 0);
  const totalObj: Record<string, { linesAdded: number; linesDeleted: number; percentage: number }> = {};
  for (const user of Object.keys(userTotals)) {
    totalObj[user] = {
      linesAdded: 0,
      linesDeleted: 0,
      percentage: (userTotals[user] / totalSum) * 100
    };
  }

  contributions['TOTAL'] = totalObj;

  return contributions;
};
const generateStatsFromDB = async (
  repositoryId: number,
  branchId: number
): Promise<ContributionStats> => {
  const commitBranches = await CommitBranch.findAll({
    where: { branchId },
    include: [{ model: Commit, include: [User] }]
  });

  const commitIds = commitBranches.map(cb => cb.commitId);

  const files = await CommitFile.findAll({
    where: { commitId: commitIds }
  });

  const currentFiles = new Set<string>(
    (await getCurrentFilesFromBranch(
      (await Repository.findByPk(repositoryId))!.url,
      (await Branch.findByPk(branchId))!.name
    )).map(normalizePath)
  );

  const contributions: ContributionStats = {};
  for (const filePath of currentFiles) {
    contributions[filePath] = {};
  }

  for (const cb of commitBranches) {
    const commit = cb.get('Commit') as Commit;
    const login = commit.User?.githubLogin || 'Desconocido';
    const commitFiles = files.filter(f => f.commitId === commit.id);

    for (const file of commitFiles) {
      let filePath = normalizePath(file.filePath);
      filePath = filePath.replace(/\{.*=>\s*(.*?)\}/, '$1');
      filePath = filePath.replace(/^"(.*)"$/, '$1');

      if (!currentFiles.has(filePath)) continue;

      if (!contributions[filePath]) contributions[filePath] = {};
      if (!contributions[filePath][login]) {
        contributions[filePath][login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 0
        };
      }

      contributions[filePath][login].linesAdded += file.linesAdded || 0;
      contributions[filePath][login].linesDeleted += file.linesDeleted || 0;
    }
  }

  // Calcula porcentajes por archivo
  for (const filePath in contributions) {
    const stats = contributions[filePath];
    let total = Object.values(stats).reduce((acc, cur) => acc + cur.linesAdded + cur.linesDeleted, 0);

    if (total === 0 && Object.keys(stats).length === 1) {
      total = 1;
    }

    for (const user in stats) {
      const userTotal = stats[user].linesAdded + stats[user].linesDeleted;
      stats[user].percentage = total > 0 ? (userTotal / total) * 100 : 100;
    }
  }

  // Carpetas
  const folderContributions: ContributionStats = {};
  for (const filePath in contributions) {
    const parts = filePath.split('/');
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

  for (const folder of Object.keys(folderContributions)) {
    const total = Object.values(folderContributions[folder]).reduce((s, val) => s + val.percentage, 0);
    if (total > 0) {
      for (const user of Object.keys(folderContributions[folder])) {
        folderContributions[folder][user].percentage =
          (folderContributions[folder][user].percentage / total) * 100;
      }
    }
  }

  for (const key of Object.keys(folderContributions)) {
    if (!contributions[key]) contributions[key] = folderContributions[key];
  }

  const userTotals: Record<string, number> = {};
  for (const path of Object.keys(contributions)) {
    for (const user of Object.keys(contributions[path])) {
      userTotals[user] = (userTotals[user] || 0) + contributions[path][user].percentage;
    }
  }

  const totalSum = Object.values(userTotals).reduce((sum, val) => sum + val, 0);
  const totalObj: Record<string, { linesAdded: number; linesDeleted: number; percentage: number }> = {};
  for (const user of Object.keys(userTotals)) {
    totalObj[user] = {
      linesAdded: 0,
      linesDeleted: 0,
      percentage: (userTotals[user] / totalSum) * 100
    };
  }

  contributions['TOTAL'] = totalObj;

  return contributions;
};