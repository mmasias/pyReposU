import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";
import { existsSync } from "fs";
import { rimraf } from "rimraf";
const rimrafAsync = promisify(rimraf);


import { mkdtemp } from "fs/promises";
import os from "os";

export const prepareRepo = async (repoUrl: string): Promise<string> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repo-"));

  console.log(`[prepareRepo] Clonando repositorio en: ${tempDir}`);
  const git = simpleGit();
  await git.clone(repoUrl, tempDir);

  return tempDir;
};

import { exec } from "child_process";
import { rm } from "fs/promises";

const execAsync = promisify(exec);
import { remove } from "fs-extra"; // fs-extra ya maneja directorios en uso

export const cleanRepo = async (repoPath: string): Promise<void> => {
  try {
    console.log(`[cleanRepo] Intentando eliminar directorio: ${repoPath}`);
    await remove(repoPath);
    console.log(`[cleanRepo] Directorio eliminado correctamente: ${repoPath}`);
  } catch (error) {
    console.error(`[cleanRepo] No se pudo eliminar el directorio:`, error);
    throw new Error(`No se pudo limpiar el repositorio: ${repoPath}`);
  }
};