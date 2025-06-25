import { Request, Response, NextFunction } from "express";
import { ensureCommitFileContentAndDiff } from "../../../services/visualizadorCodigo/archivos/commitFileContentAndDiff";
import { AppError } from "../../../middleware/errorHandler";

// Obtener contenido de un archivo en un commit
export const getFileContentHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath || !commitHash) {
    return next(new AppError("FILE_CONTENT_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const commitFile = await ensureCommitFileContentAndDiff(
      repoUrl as string,
      commitHash as string,
      filePath as string
    );
    res.status(200).send(commitFile.content || "// Archivo vacío");
  } catch (error) {
    console.error(`[getFileContentHandler]`, error);
    next(new AppError("FAILED_TO_GET_FILE_CONTENT"));
  }
};

