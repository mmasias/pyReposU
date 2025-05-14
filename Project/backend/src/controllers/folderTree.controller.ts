import { Request, Response, NextFunction } from "express";
import { Repository } from "../models/Repository";
import { getRepositoryTreeService } from "../services/getRepositoryTreeService";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";
import { AppError } from "../middleware/errorHandler";

export const getRepositoryTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, author, since, until, branch } = req.query;

  if (!repoUrl) {
    return next(new AppError("REPO_URL_REQUIRED", undefined, 400));
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repo = await Repository.findOne({ where: { url: decodedRepoUrl } });

    if (!repo) {
      return next(new AppError("REPO_NOT_FOUND", undefined, 404));
    }

    let branchToUse = branch as string | undefined;

    if (branchToUse) {
      const repoPath = await prepareRepo(decodedRepoUrl);
      const git = simpleGit(repoPath);
      const branchExists = (await git.branch(["-a"])).all.some((b) =>
        b.replace("remotes/origin/", "").trim() === branchToUse
      );

      if (!branchExists) {
        return next(new AppError("BRANCH_NOT_EXISTS_IN_REPO", `La rama '${branchToUse}' no existe en el repositorio.`, 400));
      }
    }

    const tree = await getRepositoryTreeService(repo.id, {
      author: author as string,
      since: since ? new Date(since as string) : undefined,
      until: until ? new Date(until as string) : undefined,
      repoUrl: decodedRepoUrl,
      branch: branchToUse,
    });

    if (author && (!tree.files?.length && !tree.subfolders?.length)) {
      res.status(200).json({
        warning: `No hay commits realizados por el autor '${author}'.`,
        tree: [],
      });
      return;
    }

    res.status(200).json({ tree });
  } catch (error) {
    console.error("[getRepositoryTree] Error:", error);
    next(new AppError("FAILED_TO_GET_REPO_TREE"));
  }
};

export const getCurrentBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl } = req.query;

  if (!repoUrl) {
    return next(new AppError("REPO_URL_REQUIRED", undefined, 400));
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repoPath = await prepareRepo(decodedRepoUrl);
    const git = simpleGit(repoPath);

    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    res.status(200).json({ currentBranch: branch.trim() });
  } catch (err) {
    console.error("Error al obtener la rama actual:", err);
    next(new AppError("FAILED_TO_GET_CURRENT_BRANCH"));
  }
};
