import path from "path";
import { Request, Response } from "express";
import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../services/repoService";

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !commitHash || !filePath) {
    console.warn("[getFileContent] Parámetros faltantes en la solicitud:", { repoUrl, commitHash, filePath });
    res.status(400).json({ message: "Se requieren los parámetros repoUrl, commitHash y filePath." });
    return;
  }

  console.log("[getFileContent] Parámetros recibidos:", { repoUrl, commitHash, filePath });

  let repoPath: string | null = null;

  try {
    console.log(`[getFileContent] Preparando repositorio para: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl as string);

    const git = simpleGit(repoPath);

    // Lista los archivos del commit
    console.log(`[getFileContent] Obteniendo lista de archivos del commit: ${commitHash}`);
    const lsTree = await git.raw(["ls-tree", "-r", commitHash as string]);
    const files = lsTree
      .split("\n")
      .map((line) => line.split("\t")[1])
      .filter((line) => !!line);

    console.log(`[getFileContent] Archivos encontrados en el commit:`, files);

    const normalizedFilePath = filePath as string;

    if (!files.includes(normalizedFilePath)) {
      console.warn(`[getFileContent] El archivo no se encuentra en el commit: ${normalizedFilePath}`);
      res.status(404).json({
        message: `El archivo ${normalizedFilePath} no se encuentra en el commit ${commitHash}.`,
      });
      return;
    }

    console.log(`[getFileContent] Cargando contenido del archivo: ${normalizedFilePath}`);
    const fileContent = await git.show([`${commitHash}:${normalizedFilePath}`]);

    res.status(200).send(fileContent || `Archivo vacío: ${normalizedFilePath}`);
  } catch (error) {
    console.error(`[getFileContent] Error al obtener contenido:`, error);
    res.status(500).json({
      message: `No se pudo obtener el contenido del archivo ${filePath} en el commit ${commitHash}.`,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    if (repoPath) {
      console.log(`[getFileContent] Limpiando repositorio temporal: ${repoPath}`);
      await cleanRepo(repoPath);
    }
  }
};

export const getFileDiff = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    console.warn("[getFileDiff] Parámetros faltantes en la solicitud:", {
      repoUrl,
      commitHashOld,
      commitHashNew,
      filePath,
    });
    res.status(400).json({
      message: "Se requieren los parámetros repoUrl, commitHashOld, commitHashNew y filePath.",
    });
    return;
  }

  console.log("[getFileDiff] Parámetros recibidos:", { repoUrl, commitHashOld, commitHashNew, filePath });

  const normalizedPath = path.posix.normalize(filePath as string);
  console.log(`[getFileDiff] FilePath normalizado: ${normalizedPath}`);

  if (!normalizedPath.includes(".")) {
    console.warn("[getFileDiff] El parámetro filePath no apunta a un archivo válido.");
    res.status(400).json({ message: "El parámetro filePath no apunta a un archivo válido." });
    return;
  }

  let repoPath: string | null = null;

  try {
    console.log(`[getFileDiff] Preparando repositorio para: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl as string);

    const git = simpleGit(repoPath);
    console.log(`[getFileDiff] Obteniendo diff para el archivo: ${normalizedPath}`);
    const diff = await git.diff([`${commitHashOld}:${normalizedPath}`, `${commitHashNew}:${normalizedPath}`]);

    res.status(200).send(diff);
  } catch (error) {
    console.error(`[getFileDiff] Error al obtener diff:`, error);
    res.status(500).json({
      message: "Error al obtener el diff.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    if (repoPath) {
      console.log(`[getFileDiff] Limpiando repositorio temporal: ${repoPath}`);
      await cleanRepo(repoPath);
    }
  }
};

export const getFirstCommitForFile = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  // Normaliza y valida el filePath
  const normalizedPath = path.posix.normalize(filePath as string);
  if (!normalizedPath.includes(".")) {
    res.status(400).json({ message: "El parámetro filePath no apunta a un archivo válido." });
    return;
  }

  let repoPath: string | null = null;

  try {
    console.log(`[getFirstCommitForFile] Preparando repositorio para: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl as string);

    const git = simpleGit(repoPath);

    console.log(`[getFirstCommitForFile] Buscando el primer commit para el archivo: ${normalizedPath}`);
    const firstCommitHash = await git.raw([
      "log",
      "--diff-filter=A", // Filtra solo commits donde se añadió el archivo
      "--format=%H",     // Devuelve solo el hash del commit
      normalizedPath,
    ]);

    if (!firstCommitHash.trim()) {
      res.status(404).json({ message: `El archivo ${normalizedPath} no se encontró en el historial.` });
      return;
    }

    res.status(200).json({ commitHash: firstCommitHash.trim().split("\n")[0] });
  } catch (error) {
    console.error(`[getFirstCommitForFile] Error al obtener el primer commit:`, error);
    res.status(500).json({
      message: "Error al obtener el primer commit del archivo.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    if (repoPath) {
      console.log(`[getFirstCommitForFile] Limpiando repositorio temporal: ${repoPath}`);
      await cleanRepo(repoPath);
    }
  }
};
