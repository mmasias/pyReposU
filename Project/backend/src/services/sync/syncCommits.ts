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
import { Repository } from "../../models/Repository";
import { wasProcessed, markProcessed } from "../syncState";

export const syncCommits = async (
  repo: Repository,
  localPath: string,
  _currentBranchName: string, // ya no lo usaremos directamente para isPrimary
  options: { syncStats?: boolean } = {}
) => {
  const { syncStats = false } = options;
  const git = simpleGit(localPath);

  const gitCommits = await getCommits(localPath);
  const dbHashes = await Commit.findAll({
    where: { repositoryId: repo.id },
    attributes: ["hash"],
    raw: true,
  });
  const dbHashSet = new Set(dbHashes.map(c => c.hash));
  const newCommits = gitCommits.filter(c => !dbHashSet.has(c.hash));

  if (newCommits.length === 0) {
    console.log(`[SYNC] Todo ya estaba sincronizado, saliendo rápido ✅`);
    return;
  }

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

    let normalizedDiffStats: Record<string, { added: number; deleted: number }> = {};

    const wasStatsProcessed = await wasProcessed(newCommit.id, "stats");

    if (syncStats && !wasStatsProcessed) {
      try {
        const rawStats = await getCommitDiffStats(localPath, raw.hash);
        for (const [path, stat] of Object.entries(rawStats)) {
          const cleaned = normalizePath(path)
            .replace(/\{.*=>\s*(.*?)\}/, "$1")
            .replace(/^"(.*)"$/, "$1")
            .replace(/^Project\//, "");
          normalizedDiffStats[cleaned] = stat;
        }
        await markProcessed(newCommit.id, "stats");
      } catch (err) {
        console.warn(`[STATS] ❌ Error al obtener stats para ${raw.hash}:`, err);
      }
    }

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

      if (!existingFileSet.has(unifiedPath)) {
        const stats = normalizedDiffStats[unifiedPath] || { added: 0, deleted: 0 };

        await CommitFile.create({
          commitId: newCommit.id,
          filePath: unifiedPath,
          linesAdded: stats.added,
          linesDeleted: stats.deleted,
        });
      }
    }

    // ⛳ Obtener ramas y primary branch real con `name-rev`
    const branches = await getCommitBranches(localPath, raw.hash);
    const cleanBranches = branches.map(b => b.replace(/^origin\//, "").trim());
    const allBranches = await Branch.findAll({ where: { repositoryId: repo.id } });
    const branchMap = new Map(allBranches.map(b => [b.name, b.id]));

    let primaryBranchName: string | null = null;

    try {
      const nameRevOutput = await git.raw(['name-rev', '--name-only', raw.hash]);
      // name-rev puede devolver "remotes/origin/develop~2"
      primaryBranchName = nameRevOutput
        .replace(/^remotes\/origin\//, '')
        .replace(/^origin\//, '')
        .split('~')[0]
        .trim();
    } catch (err) {
      console.warn(`[SYNC] name-rev falló para ${raw.hash}:`, err);
      primaryBranchName = null;
    }
    

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

      const [commitBranch, created] = await CommitBranch.findOrCreate({
        where: { commitId: newCommit.id, branchId },
        defaults: {
          isPrimary: primaryBranchName !== null && branchName === primaryBranchName,
        },        
      });

      // Patch: si ya existe pero isPrimary no es correcto, actualízalo
      if (!created && branchName === primaryBranchName && !commitBranch.isPrimary) {
        await commitBranch.update({ isPrimary: true });
      }
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
