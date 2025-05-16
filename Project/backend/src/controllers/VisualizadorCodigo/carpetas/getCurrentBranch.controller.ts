import { Request, Response, NextFunction } from "express";
import simpleGit from "simple-git";
import { prepareRepo } from "../../../utils/gitRepoUtils";
import { AppError } from "../../../middleware/errorHandler";

export const getCurrentBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
