import { Commit } from "../../models/Commit";
import { CommitFile } from "../../models/CommitFile";
import { Repository } from "../../models/Repository";
import { wasProcessed, markProcessed } from "../../services/syncState";
import { getFileContent, fileExistsInCommit } from "../../utils/gitRepoUtils";
import { generateFileDiff } from "../../utils/diffUtils";
import path from "path";
import { CommitParent } from "../../models/CommitParent";
import { AppError } from "../../middleware/errorHandler";

export const syncDiffsOnly = async (repo: Repository, localPath: string) => {
  const commits = await Commit.findAll({
    where: { repositoryId: repo.id },
    include: [CommitFile],
    order: [["date", "ASC"]],
  });

  for (const commit of commits) {
    const alreadyDone = await wasProcessed(commit.id, "diff");
    if (alreadyDone) continue;

    const commitFiles = await CommitFile.findAll({ where: { commitId: commit.id } });
    if (commitFiles.length === 0) continue;

    for (const cf of commitFiles) {
      try {
        const filePath = cf.filePath;
        const parentLink = await CommitParent.findOne({ where: { childId: commit.id } });
        if (!parentLink) continue;

        const parentCommit = await Commit.findByPk(parentLink.parentId);
        if (!parentCommit) continue;

        const parentHash = parentCommit.hash;

        const existsInPrev = await fileExistsInCommit(localPath, parentHash, filePath);
        const existsInCurr = await fileExistsInCommit(localPath, commit.hash, filePath);

        if (existsInPrev && existsInCurr) {
          const prevContent = await getFileContent(repo.url, parentHash, filePath);
          const currContent = await getFileContent(repo.url, commit.hash, filePath);
          const diffContent = generateFileDiff(prevContent, currContent);

          await cf.update({ diff: diffContent });
          console.log(`[DIFF] ✅ Guardado diff en ${filePath} (${commit.hash})`);
        } else {
          console.warn(`[DIFF] ⚠️ No existe archivo en ambos commits para ${filePath}`);
        }
      } catch (err) {
        console.error(`[DIFF] ❌ Error en archivo para commit ${commit.hash}:`, err);
        // 👉 Si quieres que el error rompa el proceso, lanza AppError aquí
        throw new AppError("FAILED_TO_GET_FILE_DIFF", `Error procesando diff para commit ${commit.hash}`);
      }
    }

    await markProcessed(commit.id, "diff");
  }

  console.log(`[DIFF] Diffs actualizados para repo ${repo.url} ✅`);
};
