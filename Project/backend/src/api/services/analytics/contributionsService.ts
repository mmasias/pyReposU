import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../../utils/gitRepoUtils"; 
import { normalizePath, isBinaryFile } from "../../utils/contributions.utils";

interface ContributionStats {
  [path: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

/**
 * Obtiene contribuciones de usuarios en cada archivo/carpeta y calcula la contribución total.
 */
export const getContributionsByUser = async (
  repoUrl: string,
  branch: string = "main",
  startDate?: string, 
  endDate?: string
): Promise<ContributionStats> => {
  let repoPath: string | null = null;

  try {
    repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);

    await git.fetch(["--prune", "origin"]);
    await git.checkout(branch);
    await git.pull("origin", branch, ["--force"]);

    const rawFiles = await git.raw(["ls-files"]);
    const allFiles = rawFiles.split("\n").map(normalizePath).filter((f) => f !== "");

    const contributions: ContributionStats = {};
    const binaryFileOwners: Record<string, string> = {};

    //  Obtener contribuciones por archivo
    for (const filePath of allFiles) {
      const logOutput = await git.raw([
        "log",
        "--pretty=format:%an|%ad", 
        "--date=short",
        "--numstat",
        "--follow",
        "--",
        filePath
      ]);

      const lines = logOutput.split("\n");
      let totalLinesModified = 0;
      const userEdits: Record<string, { linesAdded: number; linesDeleted: number }> = {};
      let lastUser = "";
      
      for (const line of lines) {
        if (!line.includes("\t")) {
          const [author, date] = line.split("|").map((x) => x.trim());

          //  Filtrar por fecha (si está definida)
          if (startDate && new Date(date) < new Date(startDate)) continue;
          if (endDate && new Date(date) > new Date(endDate)) continue;

          lastUser = author;
        } else {
          const [added, deleted] = line.split("\t").map(x => parseInt(x.trim()) || 0);
          if (lastUser) {
            if (!userEdits[lastUser]) {
              userEdits[lastUser] = { linesAdded: 0, linesDeleted: 0 };
            }
            userEdits[lastUser].linesAdded += added;
            userEdits[lastUser].linesDeleted += deleted;
            totalLinesModified += added + deleted;
          }
        }
      }

      if (isBinaryFile(filePath)) {
        let binaryOwner = lastUser;

        if (!binaryOwner) {
          const firstCommitLog = await git.raw([
            "log",
            "--format=%an",
            "--follow",
            "--reverse",
            "--",
            filePath
          ]);
          binaryOwner = firstCommitLog.split("\n")[0]?.trim() || "Desconocido";
        }

        contributions[filePath] = contributions[filePath] || {};
        contributions[filePath][binaryOwner] = { linesAdded: 0, linesDeleted: 0, percentage: 100 };
        binaryFileOwners[filePath] = binaryOwner;
      } else {
        for (const [user, { linesAdded, linesDeleted }] of Object.entries(userEdits)) {
          if (!contributions[filePath]) contributions[filePath] = {};
          contributions[filePath][user] = {
            linesAdded,
            linesDeleted,
            percentage: totalLinesModified > 0 ? ((linesAdded + linesDeleted) / totalLinesModified) * 100 : 0
          };
        }
      }
    }

    //  Calcular contribuciones de carpetas sumando sus archivos
    const folderContributions: ContributionStats = {};

    for (const filePath of Object.keys(contributions)) {
      const parts = filePath.split("/");
    
      for (let i = 1; i < parts.length; i++) {
        const folder = parts.slice(0, i).join("/");
    
        if (!folderContributions[folder]) folderContributions[folder] = {};
    
        for (const [user, stats] of Object.entries(contributions[filePath])) {
          if (!folderContributions[folder][user]) {
            folderContributions[folder][user] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
          }
          folderContributions[folder][user].linesAdded += stats.linesAdded;
          folderContributions[folder][user].linesDeleted += stats.linesDeleted;
          folderContributions[folder][user].percentage += stats.percentage; //  Sumar el porcentaje real
        }
      }
    }
    
    //  Normalizar para que los porcentajes no pasen de 100%
    for (const folder of Object.keys(folderContributions)) {
      const totalPercentage = Object.values(folderContributions[folder]).reduce(
        (sum, { percentage }) => sum + percentage,
        0
      );
    
      if (totalPercentage > 100) {
        for (const user of Object.keys(folderContributions[folder])) {
          folderContributions[folder][user].percentage =
            (folderContributions[folder][user].percentage / totalPercentage) * 100;
        }
      }
    }
    
    //  Fusionar carpetas y archivos
    Object.assign(contributions, folderContributions);

    //  Calcular contribución total 
    const userTotals: Record<string, number> = {};

    for (const path of Object.keys(contributions)) {
      for (const user of Object.keys(contributions[path])) {
        if (!userTotals[user]) userTotals[user] = 0;
        userTotals[user] += contributions[path][user].percentage;
      }
    }

    //  Normalizar para que el total no supere 100%
    const totalContributions = Object.values(userTotals).reduce((sum, value) => sum + value, 0);
    if (totalContributions > 0) {
      for (const user of Object.keys(userTotals)) {
        userTotals[user] = (userTotals[user] / totalContributions) * 100;
      }
    }

    //  Agregar `TOTAL` a contributions
    contributions["TOTAL"] = {};
    for (const user of Object.keys(userTotals)) {
      contributions["TOTAL"][user] = {
        linesAdded: 0,
        linesDeleted: 0,
        percentage: userTotals[user],
      };
    }

    console.log(" TOTAL contributions calculadas:", contributions["TOTAL"]);

    return contributions;
  } catch (error) {
    console.error("[ERROR] getContributionsByUser:", error);
    throw new Error("Error al calcular contribuciones.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};
