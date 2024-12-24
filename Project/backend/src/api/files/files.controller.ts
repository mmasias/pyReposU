import path from "path";
import { Request, Response } from "express";
import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../services/repoService";

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath) {
    console.warn("[getFileContent] Parámetros faltantes en la solicitud:", { repoUrl, filePath });
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  console.log("[getFileContent] Parámetros recibidos:", { repoUrl, commitHash, filePath });

  let repoPath: string | null = null;

  try {
    console.log(`[getFileContent] Preparando repositorio para: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl as string);
    const git = simpleGit(repoPath);

    // Si no se especifica commitHash, obtenemos el último commit del archivo
    let commitHashToUse = commitHash as string;
    if (!commitHashToUse) {
      console.log("[getFileContent] No se especificó commitHash, obteniendo el último commit...");
      const log = await git.log({ file: filePath as string });
      commitHashToUse = log.latest?.hash || "";
      if (!commitHashToUse) {
        throw new Error("No se pudo determinar el último commit para el archivo.");
      }
      console.log(`[getFileContent] Último commit encontrado: ${commitHashToUse}`);
    }

    // Obtener contenido del archivo para el commit especificado o el más reciente
    console.log(`[getFileContent] Cargando contenido del archivo: ${filePath} en commit: ${commitHashToUse}`);
    const fileContent = await git.show([`${commitHashToUse}:${filePath}`]);

    res.status(200).send(fileContent || `Archivo vacío: ${filePath}`);
  } catch (error) {
    console.error(`[getFileContent] Error al obtener contenido:`, error);
    res.status(500).json({
      message: `No se pudo obtener el contenido del archivo ${filePath}.`,
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
    res.status(400).json({
      message: "Se requieren los parámetros repoUrl, commitHashOld, commitHashNew y filePath.",
    });
    return;
  }

  console.log("[getFileDiff] Parámetros recibidos:", { repoUrl, commitHashOld, commitHashNew, filePath });

  const normalizedPath = path.posix.normalize(filePath as string);

  let repoPath: string | null = null;

  try {
    console.log(`[getFileDiff] Preparando repositorio para: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl as string);

    const git = simpleGit(repoPath);

    // Obtener el diff completo, sin ignorar líneas vacías
    const rawDiff = await git.diff([
      `${commitHashOld}:${normalizedPath}`,
      `${commitHashNew}:${normalizedPath}`,
    ]);

    console.log("[getFileDiff] Diff crudo obtenido:", rawDiff);

    const addedLines: string[] = [];
    const removedLines: string[] = [];

    // Procesar el diff
    const diffLines = rawDiff.split("\n");
    diffLines.forEach((line) => {
      if (line.startsWith("+") && !line.startsWith("+++")) {
        const trimmedLine = line.slice(1).replace(/\s+$/, ""); // Elimina espacios innecesarios al final
        addedLines.push(trimmedLine || "\n"); // Considera saltos de línea explícitos
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        const trimmedLine = line.slice(1).replace(/\s+$/, ""); // Elimina espacios innecesarios al final
        removedLines.push(trimmedLine || "\n"); // Considera saltos de línea explícitos
      }
    });

    res.status(200).json({
      addedLines,
      removedLines,
    });
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
