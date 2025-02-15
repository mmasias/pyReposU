import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "../../utils/gitRepoUtils"; 
import { normalizePath, isBinaryFile } from "../../utils/contributions.utils";

interface ContributionStats {
  [path: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

/**
 * Obtiene contribuciones de usuarios en cada archivo/carpeta.
 */
export const getContributionsByUser = async (
  repoUrl: string,
  branch: string = "main"
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
    const binaryFileOwners: Record<string, string> = {}; // Último usuario que modificó archivos binarios.

    for (const filePath of allFiles) {
      const logOutput = await git.raw([
        "log",
        "--pretty=format:%an",
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
          lastUser = line.trim();
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

    return contributions;
  } catch (error) {
    console.error("[ERROR] getContributionsByUser:", error);
    throw new Error("Error al calcular contribuciones.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};

