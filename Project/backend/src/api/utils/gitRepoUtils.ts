import simpleGit, { SimpleGit } from "simple-git";
import { existsSync, mkdirSync,unlinkSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { config } from "../../config/config"; 
import pLimit from "p-limit";
import {execSync} from "child_process";

//  Mutex manual para bloquear repositorios en uso
const globalRepoLock: Record<string, Promise<void> | null> = {};
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
  const gitFolder = path.join(repoPath, ".git");

  console.log(`\n [prepareRepo] Iniciando para ${repoPath}...\n`);

  if (REPO_CACHE[repoPath] && existsSync(gitFolder)) {
    console.log(` [prepareRepo] Usando repo cacheado: ${repoPath}`);
    return repoPath;
  }

  let resolveLock: () => void;
  globalRepoLock[repoPath] = new Promise<void>((resolve) => (resolveLock = resolve));

  try {
    console.log(` [prepareRepo]  Bloqueo activado para ${repoPath}`);

    //  Si la carpeta no existe, la creamos
    if (!existsSync(repoPath)) {
      console.log(` [prepareRepo] Creando carpeta: ${repoPath}`);
      mkdirSync(repoPath, { recursive: true });
    }

    // **Si el repo está cacheado y el .git existe, usamos cache**
    if (REPO_CACHE[repoPath] && existsSync(gitFolder)) {
      console.log(` [prepareRepo] Usando repo cacheado: ${repoPath}`);
      return repoPath;
    }
    const lockFile = path.join(gitFolder, "index.lock");

    if (existsSync(lockFile)) {
      console.warn(` [prepareRepo] Eliminando manualmente el bloqueo Git: ${lockFile}`);
      unlinkSync(lockFile);
    }
    //  Si la carpeta .git no existe, hay que clonar el repo
    if (!existsSync(gitFolder)) {
      console.log(` [prepareRepo] Repo corrupto o no existe. Eliminando...`);
      await rm(repoPath, { recursive: true, force: true });

      console.log(` [prepareRepo] Clonando repo: ${repoUrl}`);
      await simpleGit().clone(repoUrl, repoPath);
    }

    console.log(` [prepareRepo] Inicializando simple-git en: "${repoPath}"`);
    const git = simpleGit({ baseDir: repoPath });

    const isRepo = await git.checkIsRepo();
    if (!isRepo) throw new Error(" ERROR: Git no está correctamente inicializado");

    await git.pull("origin", "main");
    REPO_CACHE[repoPath] = git;

    console.log(` [prepareRepo] simple-git inicializado correctamente.`);
    return repoPath;
  } catch (error) {
    console.error(` [prepareRepo] ERROR con simple-git:`, error);
    throw new Error("Error al preparar el repositorio.");
  } finally {
    resolveLock!();
    globalRepoLock[repoPath] = null;
    console.log(` [prepareRepo] Bloqueo liberado para ${repoPath}`);
  }
};

/**
 * Elimina un repositorio Git de forma segura.
 * No lo elimina si está en uso.
 * @param repoPath Ruta del repositorio local.
 */
export const cleanRepo = async (repoPath: string): Promise<void> => {
  if (!existsSync(repoPath)) return;

  console.log(`[cleanRepo] 🧹 Intentando eliminar repositorio en: ${repoPath}`);

  if (globalRepoLock[repoPath]) {
    console.log("[cleanRepo]  Repo en uso, esperando...");
    await globalRepoLock[repoPath];
  }

  if (REPO_CACHE[repoPath]) {
    console.log("[cleanRepo]  Repositorio en uso, no se elimina.");
    return; // No borrar si está en uso
  }

  try {
    await rm(repoPath, { recursive: true, force: true });
    console.log(`[cleanRepo]  Repositorio eliminado.`);
  } catch (error: any) {
    console.error("[cleanRepo]  Error eliminando el repositorio:", error);
  }
};

/**
 * Obtiene todas las ramas disponibles en un repositorio.
 */
export const getRepoBranches = async (repoUrl: string): Promise<string[]> => {
  console.log(`[getRepoBranches]  Verificando con fs.existsSync -> ${existsSync(repoUrl)}`);
  
  const repoPath = await prepareRepo(repoUrl);
  console.log(`[getRepoBranches]  Verificando con fs.existsSync(.git) -> ${existsSync(path.join(repoPath, ".git"))}`);

  const git = simpleGit(repoPath);
  const rawBranches = await git.raw(["branch", "-a"]); //  Obtiene ramas remotas y locales

  const branches = rawBranches
    .split("\n")
    .map((b) => b.trim().replace("remotes/origin/", "").replace("* ", "")) //  Elimina el '* ' de la rama actual
    .filter((b, index, self) => b && !b.includes("HEAD") && self.indexOf(b) === index); //  Elimina duplicados

  console.log(`[DEBUG] Ramas filtradas:`, branches);
  return branches;
};

/**
 * Obtiene los commits de un repositorio.
 */

export const getCommits = async (repoUrl: string): Promise<any[]> => {

  const repoPath = await prepareRepo(repoUrl);
  console.log(`[getcommits]  Verificando con fs.existsSync -> ${existsSync(repoPath)}`);

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
  console.log(`[getfilecontent]  Verificando con fs.existsSync -> ${existsSync(repoPath)}`);

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
  console.log(`[getfiledif]  Verificando con fs.existsSync -> ${existsSync(repoPath)}`);

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
  console.log(`[getfirstcommitforfile]  Verificando con fs.existsSync -> ${existsSync(repoPath)}`);

  const git = simpleGit(repoPath);
  const firstCommitHash = await git.raw(["log", "--diff-filter=A", "--format=%H", filePath]);

  return firstCommitHash.trim().split("\n")[0] || null;
};