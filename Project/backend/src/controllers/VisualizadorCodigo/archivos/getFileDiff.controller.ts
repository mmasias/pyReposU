import { Request, Response, NextFunction } from "express";
import { ensureCommitFileContentAndDiff } from "../../../services/visualizadorCodigo/archivos/commitFileContentAndDiff";
import { AppError } from "../../../middleware/errorHandler";

// Obtener diff entre dos commits para un archivo
export const getFileDiffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    return next(new AppError("FILE_DIFF_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const commitFile = await ensureCommitFileContentAndDiff(
      repoUrl as string,
      commitHashNew as string,
      filePath as string,
      commitHashOld as string
    );

    const diff = commitFile.diff || '';
    const addedLines: string[] = [];
    const removedLines: string[] = [];

    diff.split("\n").forEach((line) => {
      if (line.startsWith("+ ")) addedLines.push(line.slice(2));
      else if (line.startsWith("- ")) removedLines.push(line.slice(2));
    });

    res.status(200).json({ addedLines, removedLines });
  } catch (error) {
    console.error(`[getFileDiffHandler]`, error);
    next(new AppError("FAILED_TO_GET_FILE_DIFF"));
  }
};
