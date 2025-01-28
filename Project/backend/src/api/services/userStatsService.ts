import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";
import {
  getPullRequestsByUser,
  getIssuesByUser,
  getCommentsByUser,
} from "./githubService"; 

interface UserStats {
  user: string;
  totalContributions: number;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number; 
  issues: number; 
  comments: number;
}

/**
 * Obtener estadísticas de los usuarios para un repositorio.
 */
export const getUserStats = async (
  repoUrl: string,
  branch?: string,
  startDate?: string,
  endDate?: string,
  userId?: string
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

    // Obtener detalles adicionales: PRs, issues y comentarios
    const { repoOwner, repoName } = extractRepoDetails(repoUrl);

    // Pull Requests
    const pullRequests = await getPullRequestsByUser(repoOwner, repoName, userId || "");
    pullRequests.forEach((pr) => {
      const login = pr.user?.login;
      if (login && !statsMap[login]) {
        statsMap[login] = createEmptyStats(login);
      }
      if (login) {
        statsMap[login].pullRequests += 1;
        statsMap[login].totalContributions += 1;
      }
    });

    // Issues
    const issues = await getIssuesByUser(repoOwner, repoName, userId || "");
    issues.forEach((issue) => {
      const issueUserLogin = issue.user?.login;
      if (issueUserLogin && !statsMap[issueUserLogin]) {
        statsMap[issueUserLogin] = createEmptyStats(issueUserLogin);
      }
      if (issueUserLogin) {
        statsMap[issueUserLogin].issues += 1;
        statsMap[issueUserLogin].totalContributions += 1;
      }
    });

    // Comentarios
    const comments = await getCommentsByUser(repoOwner, repoName, userId || "");
    comments.forEach((comment) => {
      const login = comment.user?.login;
      if (login && !statsMap[login]) {
        statsMap[login] = createEmptyStats(login);
      }
      if (login) {
        statsMap[login].comments += 1;
        statsMap[login].totalContributions += 1;
      }
    });

    // Devolver las estadísticas como un array
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

/**
 * Crear un objeto vacío para inicializar estadísticas de un usuario.
 */
const createEmptyStats = (user: string): UserStats => ({
  user,
  totalContributions: 0,
  commits: 0,
  linesAdded: 0,
  linesDeleted: 0,
  pullRequests: 0,
  issues: 0,
  comments: 0,
});

/**
 * Extraer propietario y nombre del repositorio desde la URL.
 * Elimina el sufijo `.git` si está presente.
 */
const extractRepoDetails = (repoUrl: string) => {
  const cleanUrl = repoUrl.replace(/\.git$/, ""); // Eliminar ".git" al final de la URL
  const [repoOwner, repoName] = cleanUrl.replace("https://github.com/", "").split("/");
  return { repoOwner, repoName };
};