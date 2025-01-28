import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import { getUserStats } from "../../services/userStatsService";
import { getRepoBranches } from "../../services/githubService";

/**
 * Controlador para obtener estadísticas de usuario.
 */
const getUserStatsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { repoUrl, branch = "all", startDate, endDate } = req.query;
    if (!repoUrl || !startDate || !endDate) {
      res.status(400).json({ error: "Parámetros faltantes" });
      return;
    }

    const [repoOwner, repoName] = new URL(repoUrl as string).pathname.slice(1).split("/");
    const branches = branch === "all" ? await getRepoBranches(repoOwner, repoName) : [branch];

    let allStats: any[] = [];
    for (const br of branches) {
      const stats = await getUserStats(repoUrl as string, br as string, startDate as string, endDate as string);
      allStats = allStats.concat(stats.map((s: any) => ({ ...s, branch: br })));
    }

    res.json(allStats);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para exportar estadísticas a CSV.
 */
const exportStatsToCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { repoUrl, branch, startDate, endDate, userId } = req.query;

    if (!repoUrl) {
      res.status(400).json({ message: "El parámetro repoUrl es obligatorio." });
      return;
    }

    const stats = await getUserStats(
      repoUrl as string,
      branch as string,
      startDate as string,
      endDate as string,
      userId as string
    );

    const fields = ["user", "totalContributions", "commits", "linesAdded", "linesDeleted", "pullRequests", "issues", "comments"];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(stats);

    res.header("Content-Type", "text/csv");
    res.attachment("user-stats.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const getBranchesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { repoUrl } = req.query;
    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere repoUrl" });
      return;
    }

    const [repoOwner, repoName] = new URL(repoUrl as string).pathname.slice(1).split("/");
    if (!repoOwner || !repoName) {
      res.status(400).json({ error: "URL del repo inválida" });
      return;
    }

    const branches = await getRepoBranches(repoOwner, repoName);
    res.json(branches);
  } catch (error) {
    next(error);
  }
};

export { getUserStatsHandler, exportStatsToCSV, getBranchesHandler };
