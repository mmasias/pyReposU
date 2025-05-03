import { RequestHandler } from "express";
import { syncRepoIfNeeded } from "../services/syncService";
import { SyncOptions } from "../types/syncOptions";
import { Branch } from "../models/Branch";
import { Repository } from "../models/Repository";
import { CommitBranch } from "../models/CommitBranch";
import { CommitFile } from "../models/CommitFile";
import { Commit } from "../models/Commit";

export const ensureRepoSynced = (options: SyncOptions = {}): RequestHandler => {
  return async (req, res, next) => {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "main";

    if (!repoUrl) {
      res.status(400).json({ message: "Falta el parámetro repoUrl" });
      return;
    }

    try {
      await syncRepoIfNeeded(repoUrl, {
        syncCommits: true,
        syncStats: true,
        syncDiffs: false,
      });
      
      const repo = await Repository.findOne({ where: { url: repoUrl } });
      if (!repo) throw new Error("Repositorio no encontrado tras sync");

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
          }
          else {
            console.warn(`[🛑 ensureRepoSynced] Commit ${commit?.hash} encontrado, pero sin archivos (fileCount=${fileCount})`);
          }
        }
        

        // Justo antes de lanzar el error final
        if (!isReady) {
          console.warn(`[🟡 WARN] Ningún commit con archivos útiles en rama "${branch}" tras sincronización`);
          // No lanza error si hay commits pero todos vacíos (como merges)
          const commits = await CommitBranch.count({ where: { branchId: freshBranch.id } });
          if (commits > 0) {
            return next(); // ⚠️ Permitir pasar si hay commits, aunque sin archivos útiles
          }

          throw new Error(`No se encontró una rama con commits y archivos después de sincronizar`);
        }

      }


      next();
    } catch (err) {
      console.error("[ensureRepoSynced] Error al sincronizar:", err);
      res.status(500).json({ message: "Error al sincronizar el repositorio y ramas" });
    }
  };
};
