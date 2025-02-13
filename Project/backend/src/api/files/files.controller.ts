import { Request, Response } from "express";
import { GitRepositoryService } from "../services/gitService/GitRepositoryService";

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  const gitService = new GitRepositoryService(repoUrl as string);

  try {
    await gitService.init();

    let commitHashToUse = commitHash as string;
    if (!commitHashToUse) {
      const commits = await gitService.getCommits();
      commitHashToUse = commits[0]?.hash || "";
      if (!commitHashToUse) {
        throw new Error("No se pudo determinar el último commit para el archivo.");
      }
    }

    const fileContent = await gitService.getFileContent(commitHashToUse, filePath as string);
    res.status(200).send(fileContent || `Archivo vacío: ${filePath}`);
  } catch (error) {
    console.error(`[getFileContent] Error:`, error);
    res.status(500).json({ message: "Error al obtener contenido del archivo." });
  } finally {
    await gitService.cleanup();
  }
};

export const getFileDiff = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    res.status(400).json({
      message: "Se requieren los parámetros repoUrl, commitHashOld, commitHashNew y filePath.",
    });
    return;
  }

  const gitService = new GitRepositoryService(repoUrl as string);

  try {
    await gitService.init();
    const diff = await gitService.getFileDiff(commitHashOld as string, commitHashNew as string, filePath as string);
    res.status(200).json(diff);
  } catch (error) {
    console.error(`[getFileDiff] Error:`, error);
    res.status(500).json({ message: "Error al obtener el diff." });
  } finally {
    await gitService.cleanup();
  }
};

export const getFirstCommitForFile = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  const gitService = new GitRepositoryService(repoUrl as string);

  try {
    await gitService.init();
    const firstCommitHash = await gitService.getFirstCommitForFile(filePath as string);

    if (!firstCommitHash) {
      res.status(404).json({ message: `El archivo ${filePath} no se encontró en el historial.` });
      return;
    }

    res.status(200).json({ commitHash: firstCommitHash });
  } catch (error) {
    console.error(`[getFirstCommitForFile] Error:`, error);
    res.status(500).json({ message: "Error al obtener el primer commit del archivo." });
  } finally {
    await gitService.cleanup();
  }
};
