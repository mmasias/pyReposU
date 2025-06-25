import { Request, Response, NextFunction } from "express";
import { Repository } from "../../../models/Repository";
import simpleGit from "simple-git";
import { prepareRepo } from "../../../utils/gitRepoUtils";
import { AppError } from "../../../middleware/errorHandler";
import { syncCommits } from "../../../services/sync/syncCommits";
import { getRepositoryTreeService } from "../../../services/visualizadorCodigo/carpetas/getRepositoryTreeService";


export const getRepositoryTree = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { repoUrl, since, until, branch } = req.query;

  if (!repoUrl) {
    return next(new AppError("REPO_URL_REQUIRED", undefined, 400));
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repo = await Repository.findOne({ where: { url: decodedRepoUrl } });

    if (!repo) {
      return next(new AppError("REPO_NOT_FOUND", undefined, 404));
    }

    const branchToUse = branch as string | undefined;
    const sinceDate = parseDateParam(since);
    const untilDate = parseDateParam(until, true);

    console.log("[💥 DEBUG] Tipos crudos de fechas:", typeof since, since, typeof until, until);
    console.log("[🧪 DEBUG PARSED] since:", sinceDate?.toISOString(), "until:", untilDate?.toISOString());

    const repoPath = await prepareRepo(decodedRepoUrl);

    if (branchToUse) {
      const git = simpleGit(repoPath);
      const branches = await git.branch(["-a"]);
      const branchExists = branches.all.some((b) =>
        b.replace("remotes/origin/", "").trim() === branchToUse
      );

      if (!branchExists) {
        return next(
          new AppError(
            "BRANCH_NOT_EXISTS_IN_REPO",
            `La rama '${branchToUse}' no existe en el repositorio.`,
            400
          )
        );
      }

      await syncCommits(repo, repoPath, branchToUse, { syncStats: true });
    }

    const tree = await getRepositoryTreeService(repo.id, {
      since: sinceDate,
      until: untilDate,
      repoUrl: decodedRepoUrl,
      branch: branchToUse,
      repoPath,
    });

    res.status(200).json({ tree });
  } catch (error) {
    console.error("[getRepositoryTree] Error:", error);
    next(new AppError("FAILED_TO_GET_REPO_TREE"));
  }
};

/**
 * Parsea una fecha desde query params con validación segura
 */
const parseDateParam = (value: unknown, isUntil = false): Date | undefined => {
  if (!value || typeof value !== "string") return undefined;

  const dateString = isUntil
    ? `${value}T23:59:59.999Z`
    : `${value}T00:00:00.000Z`;

  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};
