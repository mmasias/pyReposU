import { Commit, CommitFile, Repository } from "../../../models";
import { getFileContent, getFileDiff, prepareRepo } from "../../../utils/gitRepoUtils";
import simpleGit from "simple-git";
import { AppError } from "../../../middleware/errorHandler";

/**
 * Asegura que un archivo tenga contenido y/o diff cacheado para un commit.
 * Si no existe, lo calcula y guarda.
 */
export const ensureCommitFileContentAndDiff = async (
  repoUrl: string,
  commitHash: string,
  filePath: string,
  prevCommitHash?: string
): Promise<CommitFile> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) {
    throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);
  }

  // Resolver HEAD como hash real si se envía así
  if (commitHash === "HEAD") {
    const repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);
    commitHash = (await git.revparse(["HEAD"])).trim();
  }

  const commit = await Commit.findOne({
    where: { hash: commitHash, repositoryId: repo.id },
  });
  if (!commit) {
    throw new AppError("COMMIT_NOT_FOUND", `Commit no encontrado: ${commitHash}`, 404);
  }

  const [commitFile] = await CommitFile.findOrCreate({
    where: {
      commitId: commit.id,
      filePath,
    },
    defaults: {
      linesAdded: 0,
      linesDeleted: 0,
      diff: '',
      content: '',
    },
  });

  // Cachear contenido si falta
  if (!commitFile.content) {
    const content = await getFileContent(repoUrl, commitHash, filePath);
    commitFile.content = content;
    await commitFile.save();
  }

  // Cachear diff si hay commit anterior y falta diff
  if (prevCommitHash && !commitFile.diff) {
    const diff = await getFileDiff(repoUrl, prevCommitHash, commitHash, filePath);
    commitFile.diff = [
      ...(diff.removedLines.map(line => `- ${line}`)),
      ...(diff.addedLines.map(line => `+ ${line}`))
    ].join('\n');
    await commitFile.save();
  }

  return commitFile;
};
