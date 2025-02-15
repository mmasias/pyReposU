import simpleGit, { SimpleGit } from "simple-git";
import { existsSync, mkdirSync } from "fs";
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

  // Si ya tenemos el repo en memoria, lo reutilizamos
  if (REPO_CACHE[repoPath]) {
    console.log(`[prepareRepo] Reutilizando repositorio en memoria: ${repoPath}`);
    return repoPath;
  }

  try {
    if (existsSync(repoPath)) {
      console.log(`[prepareRepo] Repositorio ya existe en ${repoPath}, actualizando...`);
      const git = simpleGit(repoPath);
      await git.pull("origin", "main");
      REPO_CACHE[repoPath] = git;
    } else {
      console.log(`[prepareRepo] Creando directorio: ${repoPath}`);
      mkdirSync(repoPath, { recursive: true });

      console.log(`[prepareRepo] Clonando repositorio en: ${repoPath}`);
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
