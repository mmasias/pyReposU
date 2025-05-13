import { RequestHandler } from "express";
import { syncRepoIfNeeded } from "../services/syncService";
import { SyncOptions } from "../types/syncOptions";
import { Branch } from "../models/Branch";
import { Repository } from "../models/Repository";
import { CommitBranch } from "../models/CommitBranch";
import { CommitFile } from "../models/CommitFile";
import { Commit } from "../models/Commit";
import { AppError } from "../middleware/errorHandler";

export const ensureRepoSynced = (options: SyncOptions = {}): RequestHandler => {
  return async (req, res, next) => {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "main";

    if (!repoUrl) {
      return next(new AppError("REPO_URL_REQUIRED", undefined, 400));
    }

    try {
      await syncRepoIfNeeded(repoUrl, {
        syncCommits: true,
        syncStats: true,
        syncDiffs: false,
      });

      const repo = await Repository.findOne({ where: { url: repoUrl } });
      if (!repo) throw new AppError("REPO_NOT_FOUND", "Repositorio no encontrado tras sync", 404);

      let retries = 0;
      let isReady = false;

      while (retries < 15 && !isReady) {
        const freshRepo = await Repository.findOne({ where: { url: repoUrl } });
        const freshBranch = await Branch.findOne({
          where: { name: branch, repositoryId: freshRepo?.id },
        });

        if (!freshRepo || !freshBranch) {
          await new Promise(res => setTimeout(res, 500));
          retries++;
          continue;
        }

        const commitBranches = await CommitBranch.findAll({
          where: { branchId: freshBranch.id },
          order: [["createdAt", "DESC"]],
        });

        for (const cb of commitBranches) {
          const [commit, fileCount] = await Promise.all([
            Commit.findByPk(cb.commitId),
            CommitFile.count({ where: { commitId: cb.commitId } }),
          ]);

          if (commit && fileCount > 0) {
            isReady = true;
            break;
          } else {
            console.warn(`[🛑 ensureRepoSynced] Commit ${commit?.hash} encontrado, pero sin archivos (fileCount=${fileCount})`);
          }
        }

        if (!isReady) {
          console.warn(`[🟡 WARN] Ningún commit con archivos útiles en rama "${branch}" tras sincronización`);
          const commits = await CommitBranch.count({ where: { branchId: freshBranch.id } });
          if (commits > 0) {
            return next(); // ⚠️ Permitir pasar si hay commits, aunque vacíos
          }

          throw new AppError("SYNC_FAILED", `No se encontró una rama con commits y archivos después de sincronizar`, 500);
        }
      }

      next();
    } catch (err) {
      console.error("[ensureRepoSynced] Error al sincronizar:", err);
      next(new AppError("SYNC_FAILED"));
    }
  };
};
