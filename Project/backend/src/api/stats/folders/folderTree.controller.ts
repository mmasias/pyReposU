import { Request, Response } from "express";
import simpleGit, { SimpleGit } from "simple-git";
import path from "path";
import { removeDirectory, normalizePath } from "../../utils/file.utils";
import { PATHS } from "../../constants/path.constants";

export const getRepositoryTree = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, branch, since, until, author } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
    return;
  }

  const tempRepoPath = path.join(PATHS.TEMP_REPO, "cloned-repo");

  try {
    const git = simpleGit();

    // Decodificar la URL del repositorio
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);

    // Clonar el repositorio
    console.log("Clonando el repositorio...");
    await git.clone(decodedRepoUrl, tempRepoPath);

    const repoGit = simpleGit(tempRepoPath);

    // Cambiar a la rama si se especifica
    if (branch) {
      try {
        console.log(`[getRepositoryTree] Cambiando a la rama: ${branch}`);
        await repoGit.checkout(branch as string);
      } catch (error) {
        console.error(`[getRepositoryTree] La rama ${branch} no existe.`);
        res.status(400).json({ message: `La rama '${branch}' no existe en el repositorio.` });
        return;
      }
    }

    // Obtener estadísticas de cambios con filtros adicionales
    const logArgs = ["log", "--numstat", "--pretty=format:%H;%an;%ae;%ad;%s"];
    if (since) logArgs.push(`--since=${since}`);
    if (until) logArgs.push(`--until=${until}`);
    const gitLogOutput = await repoGit.raw(logArgs);

    const commits = gitLogOutput
      .split("\n")
      .map((line) => {
        const [hash, name, email, date, subject] = line.split(";");
        return { hash, name, email, date, subject };
      })
      .filter((commit) => commit.hash);

    if (author) {
      const filteredCommits = commits.filter((commit) => commit.name === author);
      if (filteredCommits.length === 0) {
        console.warn(`[getRepositoryTree] No hay commits del autor: ${author}`);
        res.status(200).json({
          warning: `No hay commits realizados por el autor '${author}'.`,
          tree: [],
        });
        return;
      }

      // Si hay coincidencias, reconstruir gitLogOutput
      const matchingHashes = filteredCommits.map((commit) => commit.hash);
      const matchingLog = await getFilteredLog(repoGit, matchingHashes);
      const fileChangesMap: Record<string, number> = parseGitLog(matchingLog);
      const gitFiles = await repoGit.raw(["ls-tree", "-r", "--name-only", "HEAD"]);
      const trackedFiles = gitFiles.split("\n").filter(Boolean);
      const normalizedFiles = trackedFiles.map(normalizePath);
      const tree = buildTreeFromTrackedFiles(normalizedFiles, fileChangesMap);

      res.status(200).json({ tree });
      return;
    }

    const fileChangesMap: Record<string, number> = parseGitLog(gitLogOutput);
    const gitFiles = await repoGit.raw(["ls-tree", "-r", "--name-only", "HEAD"]);
    const trackedFiles = gitFiles.split("\n").filter(Boolean);
    const normalizedFiles = trackedFiles.map(normalizePath);
    const tree = buildTreeFromTrackedFiles(normalizedFiles, fileChangesMap);

    res.status(200).json({ tree });
  } catch (error) {
    console.error("Error al obtener el árbol del repositorio:", error);
    res.status(500).json({
      message: "Error al obtener el árbol del repositorio.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    await removeDirectory(tempRepoPath);
  }
};

// Procesar la salida de `git log --numstat`
const parseGitLog = (gitLogOutput: string): Record<string, number> => {
  const fileChangesMap: Record<string, number> = {};
  const lines = gitLogOutput.split("\n");

  lines.forEach((line) => {
    const parts = line.trim().split("\t");
    if (parts.length === 3) {
      const [additions, deletions, filePath] = parts;
      const totalChanges = parseInt(additions, 10) + parseInt(deletions, 10);
      if (!isNaN(totalChanges)) {
        fileChangesMap[filePath] = (fileChangesMap[filePath] || 0) + totalChanges;
      }
    }
  });

  return fileChangesMap;
};

// Obtener log filtrado por hashes
const getFilteredLog = async (repoGit: SimpleGit, hashes: string[]): Promise<string> => {
  const logs = await Promise.all(
    hashes.map(async (hash) => {
      return repoGit.raw(["log", "--numstat", "--pretty=format:", hash]);
    })
  );
  return logs.join("\n");
};

// Construir el árbol a partir de archivos rastreados por Git y estadísticas de cambios
const buildTreeFromTrackedFiles = (
  trackedFiles: string[],
  fileChangesMap: Record<string, number>
) => {
  const tree: any = { subfolders: [], files: [] };

  trackedFiles.forEach((filePath) => {
    const parts = filePath.split("/");
    let currentLevel = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        currentLevel.files.push({
          name: part,
          changes: fileChangesMap[filePath] || 0,
        });
      } else {
        let folder = currentLevel.subfolders.find((sub: any) => sub.name === part);
        if (!folder) {
          folder = { name: part, subfolders: [], files: [], changes: 0 };
          currentLevel.subfolders.push(folder);
        }
        folder.changes += fileChangesMap[filePath] || 0;
        currentLevel = folder;
      }
    });
  });

  return tree;
};
