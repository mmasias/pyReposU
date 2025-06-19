import { Request, Response, NextFunction } from "express";
import { getContributionsByUser } from "../../services/HeatMap/heatMapService";
import { Repository } from "../../models/Repository"; 
import { CommitBranch } from "../../models/CommitBranch";
import { Branch } from "../../models/Branch"; 
import { Commit } from "../../models/Commit"; 
import { wasProcessed } from "../../services/sync/syncState";
import { AppError } from "../../middleware/errorHandler"; 

type CommitBranchWithCommit = CommitBranch & {
  commit?: Commit;
};

export const getUserContributionsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { repoUrl, branch = "main", startDate, endDate } = req.query;

    if (!repoUrl) {
      throw new AppError("REPO_URL_REQUIRED", undefined, 400);
    }

    const repo = await Repository.findOne({ where: { url: repoUrl } });
    if (!repo) {
      throw new AppError("REPO_NOT_FOUND", undefined, 404);
    }

    const branchRecord = await Branch.findOne({
      where: { name: branch as string, repositoryId: repo.id },
    });

    if (!branchRecord) {
      throw new AppError("BRANCH_NOT_FOUND", `Rama no encontrada: ${branch}`, 404); // Custom message allowed
    }

    const latestCommitBranch = await CommitBranch.findOne({
      where: { branchId: branchRecord.id },
      include: [{ model: Commit, as: 'commit' }],
      order: [[{ model: Commit, as: 'commit' }, 'date', 'DESC']],
    }) as CommitBranchWithCommit | null;

    if (latestCommitBranch?.commit) {
      const hasStats = await wasProcessed(latestCommitBranch.commit.id, "stats");

      if (!hasStats) {
        throw new AppError("DATA_PROCESSING", undefined, 202);
      }
    }

    const contributions = await getContributionsByUser(
      repoUrl as string,
      branch as string,
      startDate as string,
      endDate as string
    );

    res.json(contributions);
  } catch (error) {
    next(error);
  }
};

