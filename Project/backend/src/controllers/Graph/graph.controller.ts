import { Request, Response, RequestHandler, NextFunction } from 'express';
import { getRepoGraphService } from '../../services/Graph/graph.service';
import { AppError } from '../../middleware/errorHandler';

export const getRepoGraphController: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("[GRAPH] Query recibida:", req.query); 
  const repoUrl = req.query.repoUrl as string;

  if (!repoUrl) {
    return next(new AppError("REPO_URL_MISSING", undefined, 400));
  }

  try {
    const graph = await getRepoGraphService(repoUrl);
    res.json(graph);
  } catch (error: any) {
    console.error(`[getRepoGraphController] Error:`, error);
    next(new AppError("FAILED_TO_PROCESS_REPO_GRAPH"));
  }
};
