import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";

interface UserStats {
  user: string;
  totalContributions: number;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number; // Esto depende si tienes datos externos para PRs
  issues: number; // Similar a PRs
  comments: number; // Si puedes contar comentarios en PRs o issues
}

export const getUserStats = async (
    repoUrl: string,
    branch?: string,
    startDate?: string,
    endDate?: string,
    userId?: string // Nuevo parámetro añadido
  ): Promise<UserStats[]> => {
  let repoPath: string | null = null;
  try {
    // Preparar el repositorio
    repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);

    // Cambiar a la rama especificada (si existe)
    if (branch) {
      await git.checkout(branch);
    }

    // Obtener el historial de commits
    const logOptions: Record<string, string> = {};
    if (startDate) logOptions["--since"] = startDate;
    if (endDate) logOptions["--until"] = endDate;

    const log = await git.log(logOptions);

    // Procesar commits para obtener estadísticas por usuario
    const statsMap: Record<string, UserStats> = {};
    for (const commit of log.all) {
      const author = commit.author_name;

      // Obtener archivos y cambios en cada commit
      const diffOutput = await git.raw([
        "show",
        "--stat",
        "--oneline",
        commit.hash,
      ]);

      const addedLines = (diffOutput.match(/\d+ insertions?/g) || []).reduce(
        (sum, line) => sum + parseInt(line.split(" ")[0]),
        0
      );
      const deletedLines = (diffOutput.match(/\d+ deletions?/g) || []).reduce(
        (sum, line) => sum + parseInt(line.split(" ")[0]),
        0
      );

      if (!statsMap[author]) {
        statsMap[author] = {
          user: author,
          totalContributions: 0,
          commits: 0,
          linesAdded: 0,
          linesDeleted: 0,
          pullRequests: 0,
          issues: 0,
          comments: 0,
        };
      }

      // Actualizar estadísticas del autor
      statsMap[author].commits += 1;
      statsMap[author].linesAdded += addedLines;
      statsMap[author].linesDeleted += deletedLines;
      statsMap[author].totalContributions += 1;
    }

    return Object.values(statsMap);
  } catch (error) {
    console.error("[getUserStats] Error al obtener estadísticas:", error);
    throw new Error("Error al calcular estadísticas de usuario.");
  } finally {
    if (repoPath) {
      await cleanRepo(repoPath);
    }
  }
};
