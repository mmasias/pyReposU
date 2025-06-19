import { Request, Response, NextFunction } from "express";
import { getRepoBranches } from "../../utils/gitRepoUtils";
import { AppError } from "../../middleware/errorHandler";


export const getBranchesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      return next(new AppError("REPO_URL_REQUIRED_FOR_BRANCHES", undefined, 400));
    }

    const branches = await getRepoBranches(repoUrl);
    res.json(branches);
  } catch (error) {
    console.error("[getBranchesHandler] Error:", error);
    next(new AppError("INTERNAL_ERROR"));
  }
};
