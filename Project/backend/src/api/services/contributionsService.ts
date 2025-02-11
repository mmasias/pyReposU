import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";
import { normalizePath, isBinaryFile } from "../utils/contributions.utils";

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

        // Si no hay dueño detectado, buscamos el commit más antiguo para obtenerlo
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
        // Para archivos de texto, calculamos el porcentaje normal
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

    // Cálculo de porcentajes para carpetas
    const folderContributions: ContributionStats = JSON.parse(JSON.stringify(contributions));
    const folderFiles: Record<string, number> = {}; // Cuenta los archivos en cada carpeta

    for (const filePath of Object.keys(contributions)) {
      const parts = filePath.split("/");
      while (parts.length > 1) {
        parts.pop();
        const folderPath = parts.join("/");

        for (const user of Object.keys(contributions[filePath])) {
          if (!folderContributions[folderPath]) folderContributions[folderPath] = {};
          if (!folderContributions[folderPath][user]) {
            folderContributions[folderPath][user] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
          }

          folderContributions[folderPath][user].percentage += contributions[filePath][user].percentage;
        }

        // Asegurar que la carpeta se cuenta aunque solo tenga imágenes/PDFs
        if (!folderFiles[folderPath]) folderFiles[folderPath] = 0;
        folderFiles[folderPath]++;
      }
    }

    // Verificar si alguna carpeta solo tiene binarios y asignar el último usuario
    Object.keys(folderFiles).forEach((folderPath) => {
      const binaryOwner = Object.entries(binaryFileOwners).find(([file]) => file.startsWith(folderPath))?.[1];
      if (binaryOwner) {
        if (!folderContributions[folderPath]) folderContributions[folderPath] = {};
        if (!folderContributions[folderPath][binaryOwner]) {
          folderContributions[folderPath][binaryOwner] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
        }
        folderContributions[folderPath][binaryOwner].percentage = 100;
      }
    });

    // Normalizar para que los porcentajes no superen 100%
    for (const path of Object.keys(folderContributions)) {
      const totalPercentage = Object.values(folderContributions[path]).reduce(
        (sum, { percentage }) => sum + percentage,
        0
      );

      if (totalPercentage > 100) {
        for (const user of Object.keys(folderContributions[path])) {
          folderContributions[path][user].percentage =
            (folderContributions[path][user].percentage / totalPercentage) * 100;
        }
      }
    }

    // Calcular contribución total de cada usuario
    const userTotals: Record<string, number> = {};

    for (const path of Object.keys(folderContributions)) {
      for (const user of Object.keys(folderContributions[path])) {
        if (!userTotals[user]) userTotals[user] = 0;
        userTotals[user] += folderContributions[path][user].percentage;
      }
    }

    // Normalizar sobre 100
    const totalContributions = Object.values(userTotals).reduce((sum, value) => sum + value, 0);
    if (totalContributions > 0) {
      for (const user of Object.keys(userTotals)) {
        userTotals[user] = (userTotals[user] / totalContributions) * 100;
      }
    }

    // Agregar datos al objeto `folderContributions` con clave especial "TOTAL"
    folderContributions["TOTAL"] = {};
    for (const user of Object.keys(userTotals)) {
      folderContributions["TOTAL"][user] = {
        linesAdded: 0, // No aplicable
        linesDeleted: 0, // No aplicable
        percentage: userTotals[user],
      };
    }

    return folderContributions;
  } catch (error) {
    console.error("[ERROR] getContributionsByUser:", error);
    throw new Error("Error al calcular contribuciones.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};
