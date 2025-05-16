import { Commit } from "../../../models/Commit";
import { Repository } from "../../../models/Repository";
import { User } from "../../../models/User";
import { CommitFile } from "../../../models/CommitFile";
import { AppError } from "../../../middleware/errorHandler";

/**
 * Devuelve todos los commits de un repo, con autor y archivos modificados.
 */
export const getCommits = async (repoUrl: string) => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) {
    throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);
  }

  const commits = await Commit.findAll({
    where: { repositoryId: repo.id },
    include: [
      { model: User, attributes: ["githubLogin", "name"] },
      { model: CommitFile, attributes: ["filePath", "linesAdded", "linesDeleted"] }
    ],
    order: [["date", "DESC"]],
  });

  return commits.map((commit) => ({
    hash: commit.hash,
    message: commit.message,
    date: commit.date,
    author: commit.User?.githubLogin || "Desconocido",
    files: commit.CommitFiles?.map((f) => f.filePath) || [],
  }));
};
