import { Request, Response } from "express";
import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../services/repoService";

export const getCommits = async (req: Request, res: Response): Promise<void> => {
  const repoUrl = req.query.repoUrl as string | undefined;

  if (!repoUrl) {
    res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
    return;
  }

  let repoPath: string | null = null;

  try {
    console.log(`[getCommits] Preparando repositorio: ${repoUrl}`);
    repoPath = await prepareRepo(repoUrl);

    const git = simpleGit(repoPath);
    const log = await git.log();

    // Agregar los archivos asociados a cada commit
    const commits = await Promise.all(
      log.all.map(async (commit) => {
        const filesOutput = await git.raw([
          "show",
          "--pretty=format:", // Solo queremos la lista de archivos
          "--name-only",
          commit.hash,
        ]);

        const files = filesOutput
          .split("\n")
          .filter((file) => file) // Remover líneas vacías
          .map((file) => file.trim());

        return {
          hash: commit.hash,
          message: commit.message,
          date: commit.date,
          author: commit.author_name,
          files, // Asociar los archivos al commit
        };
      })
    );

    res.status(200).json(commits);
  } catch (error) {
    console.error(`[getCommits] Error al obtener commits:`, error);
    res.status(500).json({
      message: "Error al obtener commits.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    if (repoPath) {
      console.log(`[getCommits] Limpiando repositorio temporal: ${repoPath}`);
      await cleanRepo(repoPath);
    }
  }
};
