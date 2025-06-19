
import { getBubbleChartData } from "../../services/BubbleChart/bubbleChartService";
import { AppError } from "../../middleware/errorHandler"; 
import { Request, Response, NextFunction } from "express";

export const getBubbleChartHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "main";

    if (!repoUrl) {
      throw new AppError("REPO_URL_REQUIRED", undefined, 400);
    }

    const bubbleData = await getBubbleChartData(repoUrl, branch);
    res.json(bubbleData);
  } catch (error) {
    next(error);
  }
};
