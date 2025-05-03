// services/sync/syncCommits.ts

import { Commit } from "../../models/Commit";
import { CommitFile } from "../../models/CommitFile";
import { User } from "../../models/User";
import { Branch } from "../../models/Branch";
import { CommitBranch } from "../../models/CommitBranch";
import { CommitParent } from "../../models/CommitParent";
import { normalizePath } from "../../utils/file.utils";
import {
  getCommits,
  getCommitBranches,
  detectRenames,
  getCommitDiffStats
} from "../../utils/gitRepoUtils";
import simpleGit from "simple-git";
import path from "path";
import { Repository } from "../../models/Repository";
import { wasProcessed, markProcessed } from "../syncState";

export const syncCommits = async (
  repo: Repository,
  localPath: string,
  options: { syncStats?: boolean } = {}
) => {
  const { syncStats = false } = options;
  const git = simpleGit(localPath);

  // 🔥 1. Obtener todos los commits desde Git
  const gitCommits = await getCommits(localPath);

  // ⚡ 2. Cargar todos los hashes ya presentes en DB
  const dbHashes = await Commit.findAll({
    where: { repositoryId: repo.id },
    attributes: ["hash"],
    raw: true,
  });
  const dbHashSet = new Set(dbHashes.map(c => c.hash));

  // 🚀 3. Filtrar solo los commits nuevos
  const newCommits = gitCommits.filter(c => !dbHashSet.has(c.hash));

  if (newCommits.length === 0) {
    console.log(`[SYNC] Todo ya estaba sincronizado, saliendo rápido ✅`);
    return;
  }

  // 🧠 4. Procesar solo los commits nuevos
  for (const raw of newCommits) {
    const [user] = await User.findOrCreate({
      where: { githubLogin: raw.author },
      defaults: { name: raw.author, email: "" },
    });

    const [newCommit] = await Commit.findOrCreate({
      where: { hash: raw.hash },
      defaults: {
        message: raw.message,
        date: new Date(raw.date),
        authorId: user.id,
        repositoryId: repo.id,
      },
    });

    // 🔍 Obtener diff stats si syncStats está activo
    let normalizedDiffStats: Record<string, { added: number; deleted: number }> = {};
    console.log(`[🧪 DEBUG] Revisando si commit ${newCommit.hash} fue procesado con "stats"`);

    const wasStatsProcessed = await wasProcessed(newCommit.id, "stats");
    console.log(`[🧪 DEBUG] wasProcessed(${newCommit.id}, "stats") => ${wasStatsProcessed}`);

    if (syncStats && !wasStatsProcessed) {
      try {
        console.log(`[🔥 ENTRY] Entrando a getCommitDiffStats para ${raw.hash}`);
        const rawStats = await getCommitDiffStats(localPath, raw.hash);

        console.log(`[DEBUG][${raw.hash}] rawStats obtenidos de getCommitDiffStats:`);
        for (const key in rawStats) {
          console.log(` - ${key}:`, rawStats[key]);
        }

        for (const [path, stat] of Object.entries(rawStats)) {
          const cleaned = normalizePath(path)
            .replace(/\{.*=>\s*(.*?)\}/, "$1")
            .replace(/^"(.*)"$/, "$1")
            .replace(/^Project\//, "");

          normalizedDiffStats[cleaned] = stat;
        }

        console.log(`[DEBUG][${raw.hash}] normalizedDiffStats:`);
        console.log(normalizedDiffStats);

        await markProcessed(newCommit.id, "stats");
      } catch (err) {
        console.warn(`[STATS] ❌ Error al obtener stats para ${raw.hash}:`, err);
      }
    }

    console.log(`[DEBUG][${raw.hash}] Contenido final de normalizedDiffStats:`, Object.keys(normalizedDiffStats));

// 🔥 OPTIMIZACIÓN: evitar findOrCreate repetidos
const existingFiles = await CommitFile.findAll({
  where: { commitId: newCommit.id },
  attributes: ['filePath'],
  raw: true,
});
const existingFileSet = new Set(existingFiles.map(f => f.filePath));

for (let rawPath of raw.files || []) {
  let filePath = normalizePath(rawPath)
    .replace(/\{.*=>\s*(.*?)\}/, "$1")
    .replace(/^"(.*)"$/, "$1")
    .replace(/^Project\//, "");

  const originalPath = await detectRenames(git, filePath);
  const unifiedPath = normalizePath(originalPath);

  console.log(`[DEBUG][${raw.hash}] Procesando archivo:`, {
    rawPath,
    unifiedPath,
    statsAvailable: normalizedDiffStats[unifiedPath] || '❌ NOT FOUND'
  });

  if (!existingFileSet.has(unifiedPath)) {
    const stats = normalizedDiffStats[unifiedPath] || { added: 0, deleted: 0 };

    await CommitFile.create({
      commitId: newCommit.id,
      filePath: unifiedPath,
      linesAdded: stats.added,
      linesDeleted: stats.deleted,
    });
  } else {
    console.log(`[SKIP] CommitFile ya existe para ${unifiedPath}, evitando duplicado.`);
  }
}


    const branches = await getCommitBranches(localPath, raw.hash);
    const cleanBranches = branches.map(b => b.replace(/^origin\//, "").trim());
    const allBranches = await Branch.findAll({ where: { repositoryId: repo.id } });
    const branchMap = new Map(allBranches.map(b => [b.name, b.id]));

    for (const branchName of cleanBranches) {
      let branchId = branchMap.get(branchName);
      if (!branchId) {
        const branch = await Branch.create({
          name: branchName,
          repositoryId: repo.id,
        });
        branchId = branch.id;
        branchMap.set(branchName, branchId);
      }

      await CommitBranch.findOrCreate({
        where: { commitId: newCommit.id, branchId },
        defaults: { isPrimary: false },
      });
    }

    for (const parentHash of raw.parents || []) {
      const parentCommit = await Commit.findOne({ where: { hash: parentHash } });
      if (parentCommit) {
        await CommitParent.findOrCreate({
          where: {
            parentId: parentCommit.id,
            childId: newCommit.id,
          },
        });
      }
    }
  }

  console.log(`[SYNC] Commits sincronizados correctamente ✅`);
};
