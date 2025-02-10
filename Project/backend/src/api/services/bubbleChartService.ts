import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";
import path from "path";

interface BubbleChartData {
    [user: string]: { date: string; linesAdded: number; linesDeleted: number; branch: string; hash: string; message: string; files: string[] }[];
  }

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

    //console.log(`    Ramas a procesar:`, branchesToProcess);

    const bubbleData: BubbleChartData = {};
    const processedCommits = new Set<string>(); // Evita duplicados

    for (const branchName of branchesToProcess) {
      try {
        //console.log(`    Procesando rama: ${branchName}`);
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

    //console.log("[DEBUG] Datos finales de bubbleData:", JSON.stringify(bubbleData, null, 2));

    return bubbleData;
  } catch (error) {
    console.error("[    ERROR] getBubbleChartData:", error);
    throw new Error("Error al generar datos para el diagrama de burbujas.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};
