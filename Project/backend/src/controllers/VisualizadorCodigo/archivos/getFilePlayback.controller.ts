import { Request, Response, NextFunction } from "express";
import { getPlaybackHistory } from "../../../services/visualizadorCodigo/archivos/filePlayback.service";
import { AppError } from "../../../middleware/errorHandler";

// Playback de archivo a lo largo del tiempo
export const getFilePlaybackHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, branch, filePath } = req.query;

  if (!repoUrl || !branch || !filePath) {
    return next(new AppError("FILE_PLAYBACK_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const data = await getPlaybackHistory(
      repoUrl as string,
      branch as string,
      filePath as string
    );

    res.status(200).json(data);
  } catch (err) {
    console.error("[getFilePlaybackHandler]", err);
    next(new AppError("FAILED_TO_GET_FILE_HISTORY"));
  }
};
