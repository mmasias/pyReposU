import simpleGit, { SimpleGit } from "simple-git";
import { existsSync, mkdirSync,unlinkSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { config } from "../../config/config"; 
const REPO_CACHE: Record<string, SimpleGit | null> = {}; // Cache de repositorios en memoria

/**
 * Clona o reutiliza un repositorio Git.
 * Si ya está clonado, lo reutiliza.
 * @param repoUrl URL del repositorio remoto.
 * @returns Ruta local del repositorio.
 */
export const prepareRepo = async (repoUrl: string): Promise<string> => {
  const repoName = new URL(repoUrl).pathname.split("/").pop()?.replace(".git", "") || "cloned-repo";
  const repoPath = path.join(__dirname, config.paths.tempRepo, repoName);

  if (REPO_CACHE[repoPath]) return repoPath;

  try {
    // 🔹 Eliminar archivo de bloqueo si existe
    const lockFile = path.join(repoPath, ".git", "index.lock");
    if (existsSync(lockFile)) {
      console.warn(`[prepareRepo] Eliminando archivo de bloqueo: ${lockFile}`);
      unlinkSync(lockFile);
    }

    if (existsSync(repoPath)) {
      const git = simpleGit(repoPath);
      await git.pull("origin", "main");
      REPO_CACHE[repoPath] = git;
    } else {
      mkdirSync(repoPath, { recursive: true });
      await simpleGit().clone(repoUrl, repoPath);
      REPO_CACHE[repoPath] = simpleGit(repoPath);
    }

    return repoPath;
  } catch (error) {
    console.error("[prepareRepo] Error:", error);
    throw new Error("No se pudo preparar el repositorio.");
  }
};


/**
 * Elimina un repositorio Git de forma segura.
 * No lo elimina si está en uso.
 * @param repoPath Ruta del repositorio local.
 */
export const cleanRepo = async (repoPath: string): Promise<void> => {
  if (!existsSync(repoPath)) return;

  console.log(`[cleanRepo] Intentando eliminar repositorio en: ${repoPath}`);

  if (REPO_CACHE[repoPath]) {
    console.log("[cleanRepo] Repositorio en uso, no se elimina.");
    return; // No borrar si está en uso
  }

  try {
    await rm(repoPath, { recursive: true, force: true });
    console.log(`[cleanRepo] Repositorio eliminado.`);
  } catch (error: any) {
    console.error("[cleanRepo] Error eliminando el repositorio:", error);
  }
};
/**
 * Obtiene todas las ramas disponibles en un repositorio.
 */
export const getRepoBranches = async (repoPath: string): Promise<string[]> => {
  const git = simpleGit(repoPath);
  const rawBranches = await git.raw(["branch", "-a"]);

  return rawBranches
    .split("\n")
    .map((b) => b.trim().replace("remotes/origin/", ""))
    .filter((b) => !b.includes("HEAD") && b !== "");
};

/**
 * Obtiene los commits de un repositorio.
 */
/**
 * Obtiene los commits de un repositorio, incluyendo archivos modificados.
 */
export const getCommits = async (repoUrl: string): Promise<any[]> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);
  const log = await git.log();

  return Promise.all(
    log.all.map(async (commit) => {
      // Obtener los archivos modificados en este commit
      const filesOutput = await git.raw([
        "show",
        "--pretty=format:",
        "--name-only",
        commit.hash,
      ]);

      return {
        hash: commit.hash,
        message: commit.message,
        date: commit.date,
        author: commit.author_name,
        files: filesOutput.split("\n").filter((file) => file.trim() !== ""),
      };
    })
  );
};

/**
 * Obtiene el contenido de un archivo en un commit específico.
 */
export const getFileContent = async (repoUrl: string, commitHash: string, filePath: string): Promise<string> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);
  try {
    const content = await git.show([`${commitHash}:${filePath}`]);
    return content || "// Archivo vacío";
  } catch (error) {
    console.error(`[getFileContent] Error obteniendo archivo: ${filePath} en commit ${commitHash}`, error);
    return "// Error al cargar contenido";
  }
};

/**
 * Obtiene las diferencias entre dos commits para un archivo.
 */
export const getFileDiff = async (repoUrl: string, commitHashOld: string, commitHashNew: string, filePath: string) => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  try {
    const rawDiff = await git.raw(["diff", `${commitHashOld}:${filePath}`, `${commitHashNew}:${filePath}`]);
    const addedLines: string[] = [];
    const removedLines: string[] = [];

    rawDiff.split("\n").forEach((line) => {
      if (line.startsWith("+") && !line.startsWith("+++")) addedLines.push(line.slice(1));
      else if (line.startsWith("-") && !line.startsWith("---")) removedLines.push(line.slice(1));
    });

    return { addedLines, removedLines };
  } catch (error) {
    console.error(`[getFileDiff] Error:`, error);
    return { addedLines: [], removedLines: [] };
  }
};

/**
 * Obtiene el primer commit en el que aparece un archivo.
 */
export const getFirstCommitForFile = async (repoUrl: string, filePath: string): Promise<string | null> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);
  const firstCommitHash = await git.raw(["log", "--diff-filter=A", "--format=%H", filePath]);

  return firstCommitHash.trim().split("\n")[0] || null;
};