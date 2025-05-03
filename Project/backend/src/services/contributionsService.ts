import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { User } from '../models/User';
import { Repository } from '../models/Repository';
import { Branch } from '../models/Branch';
import { CommitBranch } from '../models/CommitBranch';
import { Op } from 'sequelize';
import { normalizePath } from "../utils/file.utils";
import { getCurrentFilesFromBranch, getLastLocalCommitHash } from '../utils/gitRepoUtils';
import { BranchStats } from '../models/BranchStats';
import { ContributionCache } from '../models/ContributionCache';
import levenshtein from 'fast-levenshtein';


interface ContributionStats {
  [path: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}
const normalizeForComparison = (path: string) => normalizePath(path).toLowerCase();

export const getContributionsByUser = async (
  repoUrl: string,
  branch: string = 'main',
  startDate?: string,
  endDate?: string
): Promise<ContributionStats> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const branchRecord = await Branch.findOne({ where: { name: branch, repositoryId: repo.id } });
  if (!branchRecord) throw new Error(`Rama no encontrada en DB: ${branch}`);

  const latestHash = await getLastLocalCommitHash(repoUrl, branch);

  const existingStats = await BranchStats.findOne({ where: { branchId: branchRecord.id } });
  if (existingStats && existingStats.lastCommitHash === latestHash) {
    const cached = await ContributionCache.findOne({ where: { branchId: branchRecord.id } });
    if (cached) {
      console.log('✅ Stats cacheadas. Cargando desde ContributionCache');
      return JSON.parse(cached.data);
    }
  } else {
    console.log('🧠 Stats desactualizadas. Recalculando...');
    await BranchStats.upsert({
      branchId: branchRecord.id,
      lastCommitHash: latestHash,
    });
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

  const commits = await Commit.findAll({ where: commitWhere, include: [User] });
  const filteredCommitIds = commits.map(c => c.id);
  const files = await CommitFile.findAll({ where: { commitId: filteredCommitIds } });

  const currentFiles = new Set<string>(
    (await getCurrentFilesFromBranch(repoUrl, branch)).map(normalizeForComparison)
  );
  console.log('📂 currentFiles ejemplo:', [...currentFiles].slice(0, 10));

  const renames = new Map<string, string>();
  const historicalPaths = new Set<string>();
  
  for (const f of files) {
    const rawPath = f.filePath.replace(/^"(.*)"$/, '$1');
    const filePath = normalizeForComparison(rawPath);
    historicalPaths.add(filePath);
  
    // Rename explícito con {}
    if (f.filePath.includes(' => ')) {
      const match = f.filePath.match(/\{(.*) => (.*)\}/);
      if (match) {
        const prefix = f.filePath.split('{')[0];
        const suffix = f.filePath.split('}')[1] || '';
        const oldPath = normalizePath(prefix + match[1] + suffix);
        const newPath = normalizePath(prefix + match[2] + suffix);
        renames.set(normalizeForComparison(newPath), normalizeForComparison(oldPath));
        console.log(`📑 Rename detectado ({ => }): ${oldPath} → ${newPath}`);
      }
    }
  
    // Rename explícito con flecha
    if (f.filePath.includes(' → ')) {
      const [oldPathRaw, newPathRaw] = f.filePath.split(' → ').map(p =>
        normalizeForComparison(p.trim().replace(/^"(.*)"$/, '$1'))
      );
      renames.set(newPathRaw, oldPathRaw);
      console.log(`📑 Rename detectado (→): ${oldPathRaw} → ${newPathRaw}`);
    }
  }
  
  const addedPaths = new Set<string>();
  const deletedPaths = new Set<string>();
  
  // Archivos que están ahora y no estaban antes => agregados
  for (const current of currentFiles) {
    if (!historicalPaths.has(current)) {
      addedPaths.add(current);
    }
  }
  
  // Archivos que estaban antes y ya no están => eliminados
  for (const hist of historicalPaths) {
    if (!currentFiles.has(hist)) {
      deletedPaths.add(hist);
    }
  }
  
  // 🧠 Detectar renames silenciosos usando Levenshtein
  for (const added of addedPaths) {
    let bestMatch = '';
    let minDistance = Infinity;
  
    for (const deleted of deletedPaths) {
      const dist = levenshtein.get(added, deleted);
      if (dist < minDistance && dist <= 10) {
        minDistance = dist;
        bestMatch = deleted;
      }
    }
  
    if (bestMatch && !renames.has(added)) {
      renames.set(added, bestMatch);
      console.log(`🧠 Rename silencioso detectado: ${bestMatch} → ${added} (levenshtein=${minDistance})`);
    }
  }
  
  
  // 🧠 Extra: detectar renames silenciosos por similitud
  for (const added of addedPaths) {
    let bestMatch = '';
    let minDistance = Infinity;
  
    for (const deleted of deletedPaths) {
      const dist = levenshtein.get(added, deleted);
      if (dist < minDistance && dist <= 10) { // ajuste de sensibilidad
        minDistance = dist;
        bestMatch = deleted;
      }
    }
  
    if (bestMatch && !renames.has(added)) {
      renames.set(added, bestMatch);
      console.log(`🧠 Rename silencioso detectado: ${bestMatch} → ${added} (levenshtein=${minDistance})`);
    }
  }
  
    



  const contributions: ContributionStats = {};
  for (const filePath of currentFiles) {
    contributions[filePath] = {};
  }
  // 🩹 Detectar renames silenciosos (archivos en currentFiles sin contribución asignada)
  for (const filePath of currentFiles) {
    const stats = contributions[filePath];
    const isEmpty = stats && Object.values(stats).every(s => s.linesAdded === 0 && s.linesDeleted === 0);
    if (!isEmpty) continue;

    const filename = filePath.split('/').pop();
    const candidates = files.filter(f => {
      const normalized = normalizeForComparison(f.filePath.replace(/^"(.*)"$/, '$1'));
      return normalized.endsWith('/' + filename);
    });

    if (candidates.length > 0) {
      const lastTouch = candidates.map(f => {
        const commit = commits.find(c => c.id === f.commitId);
        return {
          login: commit?.User?.githubLogin || 'Desconocido',
          date: commit?.date ?? new Date(0),
        };
      }).reduce((a, b) => (a.date > b.date ? a : b));

      contributions[filePath][lastTouch.login] = {
        linesAdded: 0,
        linesDeleted: 0,
        percentage: 100
      };
      console.log(`🩹 Asignación forzada por rename silencioso: ${filePath} → ${lastTouch.login}`);
    }
  }
    // 🧠 Forzar asignación por coincidencia de nombre (cuando no hay rename ni stats)
    for (const filePath of currentFiles) {
      const stats = contributions[filePath];
      const isEmpty = stats && Object.values(stats).every(s => s.linesAdded === 0 && s.linesDeleted === 0);
      if (!isEmpty) continue;
  
      const fileName = filePath.split('/').pop()?.toLowerCase();
      const possibleOldVersions = files.filter(f =>
        normalizeForComparison(f.filePath).endsWith('/' + fileName)
      );
  
      if (possibleOldVersions.length === 0) continue;
  
      const lastTouch = possibleOldVersions
        .map(f => {
          const commit = commits.find(c => c.id === f.commitId);
          return {
            login: commit?.User?.githubLogin || 'Desconocido',
            date: commit?.date ?? new Date(0),
          };
        })
        .reduce((a, b) => (a.date > b.date ? a : b));
  
      contributions[filePath][lastTouch.login] = {
        linesAdded: 0,
        linesDeleted: 0,
        percentage: 100
      };
  
      console.log(`🧠 Asignación por coincidencia de nombre para ${filePath} → ${lastTouch.login}`);
    }
  

  // 🧠 Asigna contribuciones línea a línea
  for (const commit of commits) {
    const login = (commit as any).User?.githubLogin || 'Desconocido';
    const commitFiles = files.filter(f => f.commitId === commit.id);

    for (const file of commitFiles) {
      let rawPath = file.filePath
      .replace(/\{.*=>\s*(.*?)\}/, '$1')
      .replace(/^"(.*)"$/, '$1');
    
    let filePath = normalizeForComparison(rawPath);
      
      // DEBUG 👇
      if (!currentFiles.has(filePath)) {
        console.log(`⛔ filePath ignorado: ${filePath}`);
        
        // Mostrar posibles candidatos en currentFiles que podrían estar "mal matcheando"
        const similares = [...currentFiles].filter(p => p.includes(filePath.split('/').pop() || ''));
        if (similares.length > 0) {
          console.log(`🔍 Archivos similares en currentFiles para "${filePath}":`, similares);
        }
      }
      if (!currentFiles.has(filePath)) continue;
      if (!contributions[filePath]) contributions[filePath] = {};
      if (!contributions[filePath][login]) {
        contributions[filePath][login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 0
        };
      }

      const added = file.linesAdded || 0;
      const deleted = file.linesDeleted || 0;

      contributions[filePath][login].linesAdded += added;
      contributions[filePath][login].linesDeleted += deleted;

      // Si nadie más ha contribuido y no hubo cambios visibles, asigna autoría completa
      const totalLinesChanged = added + deleted;
      const isEmpty = Object.values(contributions[filePath]).every(
        s => s.linesAdded === 0 && s.linesDeleted === 0
      );
      if (totalLinesChanged === 0 && isEmpty) {
        contributions[filePath][login].percentage = 100;
      }
    }
  }

  // 🧠 Detectar archivos huérfanos (sin líneas contadas)
  for (const filePath of currentFiles) {
    const fileContrib = contributions[filePath];
    
    const hasContribution = fileContrib && Object.values(fileContrib).some(
      stats => stats.linesAdded > 0 || stats.linesDeleted > 0
    );

    if (filePath.includes('imprecisetime')) {
      console.log('🕵️ Revisando archivo imprecisetime:', {
        path: filePath,
        contrib: contributions[filePath],
        hasContrib: hasContribution
      });
    }
    
    if (!hasContribution) {
      const touches = files
        .map(f => {
          const norm = normalizeForComparison(f.filePath.replace(/\{.*=>\s*(.*?)\}/, '$1').replace(/^"(.*)"$/, '$1'));
          return {
            norm,
            commitId: f.commitId,
          };
        })
        .filter(t =>
          t.norm === filePath ||
          renames.get(t.norm) === filePath ||
          renames.get(filePath) === t.norm
        );

      if (touches.length > 0) {
        const lastTouch = touches
          .map(t => {
            const commit = commits.find(c => c.id === t.commitId);
            return {
              commitDate: commit?.date ?? new Date(0),
              login: commit?.User?.githubLogin || 'Desconocido',
            };
          })
          .reduce((latest, curr) =>
            curr.commitDate > latest.commitDate ? curr : latest
          );

        if (!contributions[filePath]) contributions[filePath] = {};
        contributions[filePath][lastTouch.login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 100
        };
      }
// 🛠️ Asignación genérica para archivos huérfanos: dar 100% al último que lo tocó
if (!contributions[filePath] || Object.keys(contributions[filePath]).length === 0) {
  const touches = files
    .filter(f => normalizeForComparison(f.filePath) === filePath)
    .map(f => {
      const commit = commits.find(c => c.id === f.commitId);
      return {
        login: commit?.User?.githubLogin || 'Desconocido',
        date: commit?.date ?? new Date(0),
      };
    });

  if (touches.length > 0) {
    const lastTouch = touches.reduce((a, b) => (a.date > b.date ? a : b));
    contributions[filePath] = {};
    contributions[filePath][lastTouch.login] = {
      linesAdded: 0,
      linesDeleted: 0,
      percentage: 100
    };
    console.log(`🛠️ Asignación huérfana genérica: ${filePath} → ${lastTouch.login}`);
  }
}


    }
  }
  console.log("📦 Mapa de renames detectado:", renames);
  console.log("📊 Todas las claves en contributions:", Object.keys(contributions));
  // 🧩 Carga contribuciones de archivos antiguos renombrados que no están en currentFiles
  for (const oldPath of [...renames.values()]) {
    const oldPathNormalized = normalizeForComparison(oldPath);
    if (contributions[oldPathNormalized]) continue;

    const relatedFiles = files.filter(f => {
      const normalized = normalizeForComparison(
        f.filePath.replace(/\{.*=>\s*(.*?)\}/, '$1').replace(/^"(.*)"$/, '$1')
      );
      return normalized === oldPathNormalized;
    });

    if (relatedFiles.length === 0) continue;

    contributions[oldPathNormalized] = {};
    for (const file of relatedFiles) {
      const commit = commits.find(c => c.id === file.commitId);
      const login = commit?.User?.githubLogin || 'Desconocido';

      if (!contributions[oldPathNormalized][login]) {
        contributions[oldPathNormalized][login] = {
          linesAdded: 0,
          linesDeleted: 0,
          percentage: 0
        };
      }

      contributions[oldPathNormalized][login].linesAdded += file.linesAdded || 0;
      contributions[oldPathNormalized][login].linesDeleted += file.linesDeleted || 0;
    }
  }

  // 🔁 Fusionar contribuciones de archivos renombrados
  for (const [newPathRaw, oldPathRaw] of renames.entries()) {
    const newPath = normalizeForComparison(newPathRaw);
    const oldPath = normalizeForComparison(oldPathRaw);
    console.log(`🔁 Intentando fusionar ${oldPath} ➡️ ${newPath}`);
    console.log(`📊 contributions[${oldPath}] =`, contributions[oldPath]);
    console.log(`📊 contributions[${newPath}] =`, contributions[newPath])
    // 🧪 LOG para verificar si hay contribuciones antes del merge
if (!contributions[newPath]) console.log(`⚠️ No hay contribuciones en newPath: ${newPath}`);
if (!contributions[oldPath]) console.log(`⚠️ No hay contribuciones en oldPath: ${oldPath}`);
    if (!contributions[newPath] || !contributions[oldPath]) continue;

    for (const user of Object.keys(contributions[oldPath])) {
      if (!contributions[newPath][user]) {
        contributions[newPath][user] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
      }

      contributions[newPath][user].linesAdded += contributions[oldPath][user].linesAdded;
      contributions[newPath][user].linesDeleted += contributions[oldPath][user].linesDeleted;
    }

    delete contributions[oldPath];
  }

  // ✅ Calcula porcentaje por archivo (reales)
  for (const filePath in contributions) {
    const stats = contributions[filePath];

    const manualAssignment = Object.values(stats).some(
      s => s.percentage === 100 && s.linesAdded === 0 && s.linesDeleted === 0
    );
    if (manualAssignment) continue;

    const total = Object.values(stats).reduce((acc, cur) => acc + cur.linesAdded + cur.linesDeleted, 0);
    for (const user in stats) {
      const userTotal = stats[user].linesAdded + stats[user].linesDeleted;
      stats[user].percentage = total > 0 ? (userTotal / total) * 100 : 0;
    }
  }

  // 📁 Agrupación en carpetas
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
        folderContributions[folder][user].percentage += stats.linesAdded + stats.linesDeleted;
      }
    }
  }

  // Calcula porcentaje de carpetas (usando líneas reales)
  for (const folder of Object.keys(folderContributions)) {
    const total = Object.values(folderContributions[folder]).reduce(
      (s, val) => s + val.linesAdded + val.linesDeleted,
      0
    );

    if (total > 0) {
      for (const user of Object.keys(folderContributions[folder])) {
        const userStats = folderContributions[folder][user];
        const userTotal = userStats.linesAdded + userStats.linesDeleted;
        userStats.percentage = (userTotal / total) * 100;
      }
    }
  }


  // Mezcla carpetas a archivos
  for (const key of Object.keys(folderContributions)) {
    if (!contributions[key]) contributions[key] = folderContributions[key];
  }

  // 👥 Cálculo del TOTAL
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

  await ContributionCache.upsert({
    branchId: branchRecord.id,
    data: JSON.stringify(contributions)
  });

  return contributions;
};
