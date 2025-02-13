import simpleGit from "simple-git";
import path from "path";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const prepareRepo = async (repoUrl: string): Promise<string> => {
  const repoName = new URL(repoUrl).pathname.split("/").pop()?.replace(".git", "") || "cloned-repo";
  const repoPath = path.join(__dirname, "../../temp-repo", repoName);
  const git = simpleGit(repoPath);

  if (existsSync(repoPath)) {
    console.log(`[prepareRepo] Repositorio ya existe en ${repoPath}, actualizando...`);
    try {
      await git.pull("origin", "main");
    } catch (error) {
      console.error(`[prepareRepo] Error al actualizar el repositorio:`, error);
      throw new Error(`Error al actualizar el repositorio ${repoPath}`);
    }
    return repoPath;
  }

  console.log(`[prepareRepo] Clonando repositorio en: ${repoPath}`);
  await simpleGit().clone(repoUrl, repoPath);

  return repoPath;
};

import { rm } from "fs/promises";


export const cleanRepo = async (repoPath: string): Promise<void> => {
  if (!existsSync(repoPath)) {
    console.log(`[cleanRepo] El directorio ${repoPath} ya no existe.`);
    return;
  }

  try {
    console.log(`[cleanRepo] Intentando eliminar directorio: ${repoPath}`);

    await execAsync(`taskkill /F /IM node.exe /T`).catch(() => {});

    await rm(repoPath, { recursive: true, force: true });

    console.log(`[cleanRepo] Directorio eliminado correctamente: ${repoPath}`);
  } catch (error) {
    console.error(`[cleanRepo] No se pudo eliminar el directorio:`, error);
    throw new Error(`No se pudo limpiar el repositorio: ${repoPath}`);
  }
};