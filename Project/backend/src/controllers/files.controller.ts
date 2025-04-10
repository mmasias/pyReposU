import { Request, Response } from "express";
import { getCommits, getFileContent, getFileDiff, getFirstCommitForFile } from "../utils/gitRepoUtils";

export const getFileContentHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  try {
    let commitHashToUse = commitHash as string;
    if (!commitHashToUse) {
      const commits = await getCommits(repoUrl as string);
      commitHashToUse = commits[0]?.hash || "";
      if (!commitHashToUse) {
        throw new Error("No se pudo determinar el último commit para el archivo.");
      }
    }

    const fileContent = await getFileContent(repoUrl as string, commitHashToUse, filePath as string);
    res.status(200).send(fileContent || `Archivo vacío: ${filePath}`);
  } catch (error) {
    console.error(`[getFileContent] Error:`, error);
    res.status(500).json({ message: "Error al obtener contenido del archivo." });
  }
};

export const getFileDiffHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    res.status(400).json({ message: "Faltan parámetros requeridos." });
    return;
  }

  try {
    const diff = await getFileDiff(repoUrl as string, commitHashOld as string, commitHashNew as string, filePath as string);
    res.status(200).json(diff);
  } catch (error) {
    console.error(`[getFileDiff] Error:`, error);
    res.status(500).json({ message: "Error al obtener el diff." });
  }
};

export const getFirstCommitForFileHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  try {
    const firstCommitHash = await getFirstCommitForFile(repoUrl as string, filePath as string);
    if (!firstCommitHash) {
      res.status(404).json({ message: `El archivo ${filePath} no se encontró en el historial.` });
      return;
    }
    res.status(200).json({ commitHash: firstCommitHash });
  } catch (error) {
    console.error(`[getFirstCommitForFile] Error:`, error);
    res.status(500).json({ message: "Error al obtener el primer commit del archivo." });
  }
};
export const getLatestCommitForFileHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren repoUrl y filePath." });
    return;
  }

  try {
    const commits = await getCommits(repoUrl as string);
    const last = commits.find((c) => c.files.includes(filePath as string));
    if (!last) {
      res.status(404).json({ message: "No se encontró ningún commit que modificara este archivo." });
      return;
    }

    res.status(200).json({
      hash: last.hash,
      message: last.message,
      date: last.date,
      author: last.author,
    });
  } catch (error) {
    console.error(`[getLatestCommitForFileHandler]`, error);
    res.status(500).json({ message: "Error al obtener último commit del archivo." });
  }
};
