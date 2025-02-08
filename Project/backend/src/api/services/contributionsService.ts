import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";
import { normalizePath } from "../utils/file.utils";

interface ContributionStats {
  [user: string]: {
    [folder: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

interface BubbleChartData {
  [user: string]: { date: string; linesAdded: number; linesDeleted: number; branch: string; hash: string; message: string; files: string[] }[];
}

/**
 * Obtiene las contribuciones de los usuarios en cada carpeta.
 * Calcula el % de código escrito por cada usuario.
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

    let branchesToProcess: string[];

    if (branch === "Todas") {
      const rawBranches = await git.raw(["branch", "-r"]);
      branchesToProcess = rawBranches
        .split("\n")
        .map((b) => b.trim().replace("origin/", ""))
        .filter((b) => b !== "HEAD" && b !== "");
    } else {
      branchesToProcess = [branch];
    }

    console.log(`🔄 Procesando ramas:`, branchesToProcess);

    const contributions: ContributionStats = {};
    const totalLines: Record<string, number> = {}; //     Almacena líneas totales por archivo

    for (const branchName of branchesToProcess) {
      await git.checkout(branchName);

      const logArgs = ["log", "--numstat", "--pretty=format:%H;%an;%ad", "--date=iso"];
      if (startDate) logArgs.push(`--since=${startDate}`);
      if (endDate) logArgs.push(`--until=${endDate}`);

      const logOutput = await git.raw(logArgs);
      const lines = logOutput.split("\n");

      let currentUser = "";
      let currentDate = "";

      for (const line of lines) {
        if (line.includes(";")) {
          const [, author, date] = line.split(";");
          currentUser = author.trim();
          currentDate = date.trim();

          if (!contributions[currentUser]) {
            contributions[currentUser] = {};
          }
        } else {
          const parts = line.split("\t");
          if (parts.length === 3) {
            const [added, deleted, filePath] = parts;
            const normalizedPath = normalizePath(filePath);

            if (!contributions[currentUser][normalizedPath]) {
              contributions[currentUser][normalizedPath] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
            }
            if (!totalLines[normalizedPath]) {
              totalLines[normalizedPath] = 0;
            }

            contributions[currentUser][normalizedPath].linesAdded += parseInt(added) || 0;
            contributions[currentUser][normalizedPath].linesDeleted += parseInt(deleted) || 0;
            totalLines[normalizedPath] += parseInt(added) || 0;
          }
        }
      }
    }

    //     Calcular porcentaje final de cada archivo
    for (const user in contributions) {
      for (const filePath in contributions[user]) {
        contributions[user][filePath].percentage =
          (contributions[user][filePath].linesAdded / (totalLines[filePath] || 1)) * 100;
      }
    }

    console.log("[    DEBUG] Datos finales de contribuciones:", JSON.stringify(contributions, null, 2));

    return contributions;
  } catch (error) {
    console.error("[    ERROR] getContributionsByUser:", error);
    throw new Error("Error al calcular contribuciones.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};

/**
 * Genera datos para el diagrama de burbujas basado en actividad de commits.
 */
export const getBubbleChartData = async (
  repoUrl: string,
  branch: string = "main"
): Promise<BubbleChartData> => {
  let repoPath: string | null = null;

  try {
    repoPath = await prepareRepo(repoUrl);
    const git = simpleGit(repoPath);

    //     Primero, actualizar el repo para obtener todas las ramas
    await git.fetch(["--all"]);

    let branchesToProcess: string[];

    if (branch === "Todas") {
      //     Obtener todas las ramas locales y remotas
      const rawBranches = await git.raw(["branch", "-a"]);
      branchesToProcess = rawBranches
        .split("\n")
        .map((b) => b.trim().replace("remotes/origin/", ""))
        .filter((b) => !b.includes("HEAD") && b !== "");
    } else {
      branchesToProcess = [branch]; // Solo la seleccionada
    }

    console.log(`🔄 Ramas a procesar:`, branchesToProcess);

    const bubbleData: BubbleChartData = {};
    const processedCommits = new Set<string>(); // Evita duplicados

    for (const branchName of branchesToProcess) {
      try {
        console.log(`🔄 Procesando rama: ${branchName}`);
        await git.checkout(branchName);

        const logOutput = await git.raw([
          "log",
          "--format=%H;%an;%ad;%s",
          "--date=iso",
          "--numstat",
        ]);

        const lines = logOutput.split("\n");

        let currentUser = "";
        let currentDate = "";
        let currentHash = "";
        let currentMessage = "";
        let currentFiles: string[] = [];
        let linesAdded = 0;
        let linesDeleted = 0;

        for (const line of lines) {
          if (line.includes(";")) {
            if (currentUser && currentHash && !processedCommits.has(currentHash)) {
              //     Solo agregar commits nuevos (sin duplicados)
              if (!bubbleData[currentUser]) bubbleData[currentUser] = [];
              bubbleData[currentUser].push({
                date: currentDate,
                linesAdded,
                linesDeleted,
                branch: branchName,
                hash: currentHash,
                message: currentMessage || "Sin mensaje",
                files: [...currentFiles],
              });

              processedCommits.add(currentHash);
            }

            //     Leer el nuevo commit
            const [hash, author, date, message] = line.split(";");
            currentUser = author.trim();
            currentDate = date.trim();
            currentHash = hash.trim();
            currentMessage = message?.trim() || "Sin mensaje";
            currentFiles = [];
            linesAdded = 0;
            linesDeleted = 0;
          } else if (line.trim() !== "" && !line.includes("\t")) {
            currentFiles.push(line.trim());
          } else if (line.includes("\t")) {
            const [added, deleted, filePath] = line.split("\t");
            linesAdded += parseInt(added) || 0;
            linesDeleted += parseInt(deleted.trim()) || 0;
            currentFiles.push(filePath.trim());
          }
        }

        if (currentUser && currentHash && !processedCommits.has(currentHash)) {
          if (!bubbleData[currentUser]) bubbleData[currentUser] = [];
          bubbleData[currentUser].push({
            date: currentDate,
            linesAdded,
            linesDeleted,
            branch: branchName,
            hash: currentHash,
            message: currentMessage || "Sin mensaje",
            files: currentFiles.length > 0 ? currentFiles : ["No disponible"],
          });

          processedCommits.add(currentHash);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`    Error procesando rama ${branchName}:`, error.message);
        } else {
          console.warn(`    Error procesando rama ${branchName}:`, error);
        }
      }
    }

    console.log("[    DEBUG] Datos finales de bubbleData:", JSON.stringify(bubbleData, null, 2));

    return bubbleData;
  } catch (error) {
    console.error("[    ERROR] getBubbleChartData:", error);
    throw new Error("Error al generar datos para el diagrama de burbujas.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};
