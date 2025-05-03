import simpleGit, { SimpleGit, ResetMode } from "simple-git";
import { existsSync, mkdirSync,unlinkSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { config } from "../config/config"; 
import { normalizePath } from './file.utils'; // Asegúrate de tener esto bien

import { Branch, CommitBranch, Commit, Repository } from "../models";

//  Mutex manual para bloquear repositorios en uso
const globalRepoLock: Record<string, Promise<void> | null> = {};
const REPO_CACHE: Record<string, SimpleGit | null> = {}; // Cache de repositorios en memoria

//   Mutex para evitar que varios procesos accedan al mismo tiempo
const repoLocks: Record<string, Promise<void> | null> = {};

/**
 * Clona o reutiliza un repositorio Git.
 * Si ya está clonado, lo reutiliza.
 * @param repoUrl URL del repositorio remoto.
 * @returns Ruta local del repositorio.
 */
const repoPendingPromises: Record<string, Promise<string>> = {}; //   Guardar ejecuciones en curso

export const prepareRepo = async (repoUrl: string): Promise<string> => {
  const repoName = new URL(repoUrl).pathname.split("/").pop()?.replace(".git", "") || "cloned-repo";
  const repoPath = path.join(__dirname, config.paths.tempRepo, repoName);
  const gitFolder = path.join(repoPath, ".git");
  const lockFile = path.join(gitFolder, "index.lock");

  //console.log(`\n [prepareRepo]   Iniciando para ${repoPath}...\n`);

  if (repoPendingPromises[repoPath] !== undefined) {
    console.log(` [prepareRepo]   Ya hay un proceso en curso para ${repoPath}, esperando...`);
    return repoPendingPromises[repoPath];
  }

  if (REPO_CACHE[repoPath] && existsSync(gitFolder)) {
    //console.log(` [prepareRepo]   Repo en caché, evitando duplicación.`);
    return repoPath;
  }

  if (repoLocks[repoPath]) {
    console.log(` [prepareRepo]   Esperando desbloqueo de ${repoPath}`);
    await repoLocks[repoPath];
  }

  let unlock: () => void;
  repoLocks[repoPath] = new Promise<void>((resolve) => (unlock = resolve));

  repoPendingPromises[repoPath] = (async () => {
    try {
      console.log(` [prepareRepo]   Bloqueo activado para ${repoPath}`);

      if (!existsSync(repoPath)) {
        console.log(` [prepareRepo]   Creando carpeta: ${repoPath}`);
        mkdirSync(repoPath, { recursive: true });
      }

      let attempts = 0;
      while (existsSync(lockFile)) {
        console.warn(` [prepareRepo]   Repo bloqueado. Esperando... (${++attempts})`);
        await new Promise((r) => setTimeout(r, 500));
        if (attempts > 10) throw new Error("  Timeout esperando Git.");
      }

      if (!existsSync(gitFolder)) {
        console.log(` [prepareRepo]   Repo corrupto o no existe. Clonando...`);
        await rm(repoPath, { recursive: true, force: true });
        await simpleGit().clone(repoUrl, repoPath);
      }

      const git = simpleGit({ baseDir: repoPath });

      if (!(await git.checkIsRepo())) {
        throw new Error("  ERROR: Git no está bien inicializado");
      }
      try {
        const currentBranch = (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
        const remoteHash = await getLatestRemoteCommitHash(repoPath, currentBranch);
        const localLog = await git.log([currentBranch]);
        const localHash = localLog.latest?.hash;
      
        if (remoteHash && localHash && remoteHash !== localHash) {
          console.log(`[prepareRepo] HEAD local (${localHash}) desactualizado vs remoto (${remoteHash}) — haciendo git pull en ${currentBranch}`);
          await git.pull("origin", currentBranch);
        } else {
          console.log(`[prepareRepo] HEAD ya actualizado (${currentBranch}): ${localHash}`);
        }
      } catch (pullError) {
        console.warn(`[prepareRepo] ❌ Error al intentar comparar/pullear rama activa`, pullError);
      }

      console.log(` [prepareRepo]   Haciendo git fetch --all...`);
      await git.fetch(["--all", "--prune"]);

      const remoteBranches = await git.branch(["-r"]);
      const branchList = remoteBranches.all
        .filter(b => !b.includes('->'))
        .map(b => b.replace("origin/", "").trim());

      console.log(` [prepareRepo]   Ramas remotas encontradas:`, branchList);

      for (const branch of branchList) {
        const tempBranch = `temp-sync-${branch}`;

        console.log(` [prepareRepo]   Forzando checkout de ${branch} como ${tempBranch}...`);

        try {
          while (existsSync(lockFile)) {
            console.warn(` [prepareRepo]   ${branch} bloqueada. Esperando...`);
            await new Promise((r) => setTimeout(r, 500));
          }

          await git.checkout(["-B", tempBranch, `origin/${branch}`]);
          await git.reset(ResetMode.HARD);
          await git.pull("origin", branch);

          // ❗ Opcional: eliminar rama temporal
          await git.checkout("main").catch(() => {});
          await git.deleteLocalBranch(tempBranch, true).catch(() => {});
        } catch (err) {
          console.warn(` [prepareRepo]   Error con rama ${branch}:`, err);
        }
      }

      console.log(` [prepareRepo]   Repositorio sincronizado y ramas temporales limpiadas.`);
      REPO_CACHE[repoPath] = git;
      return repoPath;

    } catch (error) {
      console.error(` [prepareRepo]   ERROR con simple-git:`, error);
      throw new Error("Error al preparar el repositorio.");
    } finally {
      unlock!();
      repoLocks[repoPath] = null;
      delete repoPendingPromises[repoPath];
      console.log(` [prepareRepo]   Bloqueo liberado para ${repoPath}`);
    }
  })();

  return repoPendingPromises[repoPath];
};




/**
 * Elimina un repositorio Git de forma segura.
 * No lo elimina si está en uso.
 * @param repoPath Ruta del repositorio local.
 */
export const cleanRepo = async (repoPath: string): Promise<void> => {
  if (!existsSync(repoPath)) return;

  console.log(`[cleanRepo]   Intentando eliminar repositorio en: ${repoPath}`);

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
  const git = simpleGit(repoPath);
  const log = await git.log(['--all', '--date=iso']);

  return Promise.all(
    
    log.all.map(async (commit) => {
      
      // ✅ Obtener archivos modificados
      const filesOutput = await git.raw([
        "show",
        "--pretty=format:",
        "--name-only",
        commit.hash,
      ]);
      const files = filesOutput
        .split("\n")
        .map(f => f.trim())
        .filter(Boolean)
        .map(normalizePath); 

      //  Obtener los parent hashes
      const rawParents = await git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);
      const parts = rawParents.trim().split(' ');
      const parents = parts.slice(1); // el primero es el propio commit

      return {
        hash: commit.hash,
        message: commit.message,
        date: commit.date,
        author: commit.author_name,
        files,
        parents, 
      };
    })
  );
};



/**
 * Obtiene el contenido de un archivo en un commit específico.
 */
export const getFileContent = async (
  repoUrl: string,
  commitHash: string,
  filePathInput: string | { path: string }
): Promise<string> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  let filePath = typeof filePathInput === 'string'
    ? filePathInput
    : filePathInput?.path;

  if (!filePath || typeof filePath !== 'string') {
    console.warn(`[⚠️ getFileContent] Ruta inválida recibida:`, filePathInput);
    return "// Archivo no válido";
  }

  const sanitizedPath = sanitizeFilePath(filePath);

  const exists = await fileExistsInCommit(repoPath, commitHash, sanitizedPath);
  if (!exists) {
    console.warn(`[getFileContent] Archivo no existe en ${commitHash}: ${sanitizedPath}`);
    return "// Archivo no existente en este commit";
  }

  try {
    const tree = await git.raw(['ls-tree', '-r', '--name-only', commitHash]);
    const availableFiles = tree.split('\n').map(line => line.trim());
    
    //console.log(`\n🗂️ Archivos disponibles en ${commitHash}:`);
    //console.log(availableFiles.slice(0, 20)); // solo mostramos los primeros 20
    
    if (!availableFiles.includes(sanitizedPath)) {
      console.warn(`⚠️ ${sanitizedPath} NO está en el commit ${commitHash}`);
    }    
    const content = await git.show([`${commitHash}:${sanitizedPath}`]);
    //console.log(`[✅ getFileContent] Archivo "${sanitizedPath}" recuperado correctamente`);
    return content || "// Archivo vacío";
  } catch (error: any) {
    console.error(`[getFileContent] Error inesperado:`, error);
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

export const getCommitBranches = async (repoPath: string, commitHash: string): Promise<string[]> => {
  const git = simpleGit(repoPath);
  const raw = await git.raw([
    'for-each-ref',
    '--format=%(refname:short)',
    `refs/remotes/origin`,
    `--contains=${commitHash}`
  ]);

  return raw
    .split('\n')
    .map(branch => branch.trim())
    .filter(b => b && !b.includes('HEAD'));
};

export const getCommitDiffStats = async (
  repoPath: string,
  commitHash: string
): Promise<Record<string, { added: number; deleted: number }>> => {
  const git = simpleGit(repoPath);
  console.log(`[🐛 getCommitDiffStats] Commit: ${commitHash}`);

  const output = await git.raw([
    'show',
    '--numstat',
    '--pretty=format:',
    commitHash,
  ]);
  console.log(`[getCommitDiffStats] Output de git show para ${commitHash}:\n${output}`);

  const lines = output.trim().split('\n');
  const stats: Record<string, { added: number; deleted: number }> = {};

  for (const line of lines) {
    console.log(`[PARSE] Línea cruda: "${line}"`);
    const parts = line.trim().split(/\s+/);
    const [addedStr, deletedStr, ...pathParts] = parts;
    const rawPath = pathParts.join(" ");

    if (!rawPath || isNaN(Number(addedStr)) || isNaN(Number(deletedStr))) {
      console.log(`[SKIP] Línea no válida: "${line}"`);
      continue;
    }

    let normalizedPath = normalizePath(rawPath.trim());
    normalizedPath = normalizedPath.replace(/\{.*=>\s*(.*?)\}/, '$1');
    normalizedPath = normalizedPath.replace(/^"(.*)"$/, '$1');

    stats[normalizedPath] = {
      added: parseInt(addedStr),
      deleted: parseInt(deletedStr),
    };

    console.log(`[OK] Archivo: ${normalizedPath} => +${addedStr} / -${deletedStr}`);
  }

  return stats;
};


export const detectRenames = async (
  git: SimpleGit,
  filePath: string
): Promise<string> => {
  const log = await git.raw([
    "log",
    "--follow",
    "--name-status",
    "--format=%H",
    "--",
    filePath,
  ]);

  const lines = log.trim().split("\n");

  // Procesamos renames (status 'R100', 'R90', etc.)
  let currentPath = filePath;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^R\d+\s+(.+?)\s+(.+)$/); // e.g., R100    old/path.txt    new/path.txt
    if (match) {
      const [, from, to] = match;
      currentPath = from.trim();
    }
  }

  return currentPath;
};

export const getCurrentFilesFromBranch = async (
  repoUrl: string,
  branch: string
): Promise<string[]> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  // Checkout sin cambiar HEAD, usamos directamente `ls-tree`
  try {
    const result = await git.raw([
      'ls-tree',
      '-r',
      '--name-only',
      `origin/${branch}`
    ]);
    return result
      .split('\n')
      .map((line) => normalizePath(line.trim()))
      .filter(Boolean);
  } catch (error) {
    console.error(`[getCurrentFilesFromBranch] Error en ls-tree de ${branch}:`, error);
    return [];
  }
};


export const getLastLocalCommitHash = async (repoUrl: string, branch: string): Promise<string | null> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) return null;

  const branchModel = await Branch.findOne({ where: { name: branch, repositoryId: repo.id } });
  if (!branchModel) return null;

  const latestLink = await CommitBranch.findOne({
    where: { branchId: branchModel.id },
    include: [{ model: Commit, as: 'commit' }],
  }) as CommitBranch & { commit: Commit }; 
  
  if (!latestLink?.commit) return null;
  
  return latestLink.commit.hash;
  
  
};


export const getLatestRemoteCommitHash = async (repoPath: string, branch: string): Promise<string> => {
  const git = simpleGit(repoPath);
  await git.fetch(); // Asegura que tienes los últimos refs

  const log = await git.log([branch]);
  return log.latest?.hash || '';
};


export const fileExistsInCommit = async (repoPath: string, commitHash: string, filePath: string): Promise<boolean> => {
  const git = simpleGit(repoPath);
  try {
    const result = await git.raw(['ls-tree', '-r', commitHash, filePath]);
    return result.trim() !== '';
  } catch (error) {
    console.error('[fileExistsInCommit] Error al comprobar archivo:', error);
    return false;
  }
};


export const safeGetFileContent = async (repoUrl: string, commit: string, filePath: string): Promise<string | null> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  const exists = await fileExistsInCommit(repoPath, commit, filePath);
  if (!exists) {
    console.warn(`⚠️ El archivo "${filePath}" no existe en el commit "${commit}"`);
    return null;
  }
  try {
    const content = await git.show([`${commit}:${filePath}`]);
    return content;
  } catch (error) {
    console.error(`[💥 safeGetFileContent] Error al obtener contenido de ${filePath} en ${commit}:`, error);
    return null;
  }
};

export const sanitizeFilePath = (rawPath: string): string => {
  const tempRepoBase = path.normalize('src/utils/temp-repo');
  const normalized = path.normalize(rawPath);

  const tempIndex = normalized.indexOf(tempRepoBase + path.sep);
  if (tempIndex === -1) return rawPath.replace(/\\/g, '/'); // fallback

  const subpath = normalized.slice(tempIndex + tempRepoBase.length + 1);
  const parts = subpath.split(path.sep);
  if (parts.length <= 1) return subpath.replace(/\\/g, '/');

  const repoRelative = parts.slice(1).join('/');
  return repoRelative;
};