import { Commit } from "../../models/Commit";
import { CommitFile } from "../../models/CommitFile";
import { Repository } from "../../models/Repository";
import { getCommits, getCommitDiffStats } from "../../utils/gitRepoUtils";
import { normalizePath } from "../../utils/file.utils";
import { wasProcessed, markProcessed } from "./syncState";
import path from "path";
import { AppError } from "../../middleware/errorHandler";

export const syncStatsOnly = async (repo: Repository, localPath: string) => {
  const commits = await getCommits(localPath);

  for (const raw of commits) {
    const commit = await Commit.findOne({
      where: {
        hash: raw.hash,
        repositoryId: repo.id,
      },
    });
    if (!commit) continue;

    const alreadyDone = await wasProcessed(commit.id, "stats");
    if (alreadyDone) continue;

    try {
      console.log(`[STATS] Calculando stats para commit ${raw.hash}`);
      const rawStats = await getCommitDiffStats(localPath, raw.hash);

      for (const [filePathRaw, value] of Object.entries(rawStats)) {
        const normalized = normalizePath(filePathRaw);
        const updated = await CommitFile.update(
          {
            linesAdded: value.added ?? 0,
            linesDeleted: value.deleted ?? 0,
          },
          {
            where: {
              commitId: commit.id,
              filePath: normalized,
            },
          }
        );

        if (updated[0] > 0) {
          console.log(`[STATS] ✅ Actualizado: ${normalized} en commit ${raw.hash}`);
        } else {
          console.warn(`[STATS] ⚠️ No se encontró CommitFile para ${normalized}`);
        }
      }

      await markProcessed(commit.id, "stats");
    } catch (err) {
      console.error(`[STATS] ❌ Error al procesar stats en ${raw.hash}:`, err);
      throw new AppError("FAILED_TO_GET_FOLDER_STATS", `Error al calcular estadísticas para commit ${raw.hash}`);
    }
  }

  console.log(`[STATS] Stats actualizados para repo ${repo.url} ✅`);
};
