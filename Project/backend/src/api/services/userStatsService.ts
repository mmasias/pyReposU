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
 * Obtiene estadísticas de los usuarios en el repositorio sumando el trabajo en todas las ramas.
 */
const getUserStats = async (
  repoUrl: string,
  branch?: string,
  startDate?: string,
  endDate?: string,
  userId?: string
): Promise<UserStats[]> => {
  let repoPath: string | null = null;

  try {
    repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);

    const branchesToAnalyze = branch && branch !== "all"
      ? [branch]
      : (await git.branch(["-r"])).all.map(b => b.trim().replace("origin/", ""));

    console.log(`[DEBUG] Analizando ramas:`, branchesToAnalyze);

    const statsMap: Record<string, UserStats> = {};

    for (const branchName of branchesToAnalyze) {
      console.log(`[DEBUG] Checkout de la rama: ${branchName}`);
      await git.checkout(branchName);

      const logOptions: Record<string, string> = {};
      if (startDate) logOptions["--since"] = startDate;
      if (endDate) logOptions["--until"] = endDate;

      const log = await git.log(logOptions);

      for (const commit of log.all) {
        const author = commit.author_name;

        if (!statsMap[author]) {
          statsMap[author] = createEmptyStats(author);
        }

        const diffOutput = await git.raw(["show", "--stat", "--oneline", commit.hash]);

        const addedLines = (diffOutput.match(/\d+ insertions?/g) || []).reduce(
          (sum, line) => sum + parseInt(line.split(" ")[0]), 0
        );

        const deletedLines = (diffOutput.match(/\d+ deletions?/g) || []).reduce(
          (sum, line) => sum + parseInt(line.split(" ")[0]), 0
        );

        statsMap[author].commits += 1;
        statsMap[author].linesAdded += addedLines;
        statsMap[author].linesDeleted += deletedLines;
        statsMap[author].totalContributions += 1;
      }
    }

    const [repoOwner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
    const repoName = repoNameRaw.replace(/\.git$/, ""); 
    console.log("[DEBUG] Cargando PRs, Issues y Comentarios...");
    const pullRequests = await getPullRequestsByUser(repoOwner, repoName, "");
    const issues = await getIssuesByUser(repoOwner, repoName, "");
    const comments = await getCommentsByUser(repoOwner, repoName, "");

    for (const user of Object.keys(statsMap)) {
      statsMap[user].pullRequests = pullRequests.filter(pr => pr.user?.login === user).length;
      statsMap[user].issues = issues.filter(issue => issue.user?.login === user).length;
      statsMap[user].comments = comments.filter(comment => comment.user?.login === user).length;
    }

    return Object.values(statsMap);
  } catch (error) {
    console.error("[getUserStats] Error:", error);
    throw new Error("Error al calcular estadísticas de usuario.");
  } finally {
    if (repoPath) {
      await cleanRepo(repoPath);
    }
  }
};

export { getUserStats };

function createEmptyStats(author: string): UserStats {
  return {
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