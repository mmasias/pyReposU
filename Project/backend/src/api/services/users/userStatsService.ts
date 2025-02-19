import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../../utils/gitRepoUtils"; 
import { getPullRequestsByUser, getIssuesByUser, getCommentsByUser } from "../github/githubService";
import { Parser } from "json2csv";

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

export const getUserStats = async (
  repoUrl: string,
  branch?: string,
  startDate?: string,
  endDate?: string
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
        if (!statsMap[author]) statsMap[author] = createEmptyStats(author);

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
    const pullRequests = await getPullRequestsByUser(repoOwner, repoName);
    const issues = await getIssuesByUser(repoOwner, repoName);
    const comments = await getCommentsByUser(repoOwner, repoName);

    [...pullRequests, ...issues, ...comments].forEach(event => {
      const username = event.user?.login;
      if (username) {
        if (!statsMap[username]) statsMap[username] = createEmptyStats(username);

        if (pullRequests.some(pr => pr.id === event.id)) statsMap[username].pullRequests += 1;
        if (issues.some(issue => issue.id === event.id)) statsMap[username].issues += 1;
        if (comments.some(comment => comment.id === event.id)) statsMap[username].comments += 1;
      }
    });

    return Object.values(statsMap);
  } catch (error) {
    console.error("[getUserStats] Error:", error);
    throw new Error("Error al calcular estadísticas de usuario.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};

//Obtener datos de issue pr y commits
export const getRepoGeneralStats = async (repoUrl: string) => {
  try {
    const [repoOwner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
    const repoName = repoNameRaw.replace(/\.git$/, "");

    console.log("[DEBUG] Cargando PRs, Issues y Comentarios...");
    const pullRequests = await getPullRequestsByUser(repoOwner, repoName);
    const issues = await getIssuesByUser(repoOwner, repoName);
    const comments = await getCommentsByUser(repoOwner, repoName);

    console.log("[DEBUG] PRs obtenidos:", pullRequests.length);
    console.log("[DEBUG] Issues obtenidos:", issues.length);
    console.log("[DEBUG] Comments obtenidos:", comments.length);

    const statsMap: Record<string, { pullRequests: number; issues: number; comments: number }> = {};

    [...pullRequests, ...issues, ...comments].forEach(event => {
      const username = event.user?.login;
      if (username) {
        if (!statsMap[username]) statsMap[username] = { pullRequests: 0, issues: 0, comments: 0 };

        if (pullRequests.some(pr => pr.user?.login === username)) statsMap[username].pullRequests += 1;
        if (issues.some(issue => issue.user?.login === username)) statsMap[username].issues += 1;
        if (comments.some(comment => comment.user?.login === username)) statsMap[username].comments += 1;
      }
    });

    console.log("[DEBUG] Mapa de PRs, Issues y Comentarios:", statsMap);
    return statsMap;
  } catch (error) {
    console.error("[getRepoGeneralStats] Error:", error);
    throw new Error("Error al obtener PRs, Issues y Comentarios.");
  }
};





/**
 * Convierte estadísticas de usuario en formato CSV.
 */
export const generateUserStatsCSV = async (repoUrl: string, branch?: string, startDate?: string, endDate?: string): Promise<string> => {
  const stats = await getUserStats(repoUrl, branch || "all", startDate || "", endDate || "");

  const fields = ["user", "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"];
  const json2csv = new Parser({ fields });

  return json2csv.parse(stats);
};

function createEmptyStats(user: string): UserStats {
  return {
    user,
    totalContributions: 0,
    commits: 0,
    linesAdded: 0,
    linesDeleted: 0,
    pullRequests: 0,
    issues: 0,
    comments: 0,
  };
}
