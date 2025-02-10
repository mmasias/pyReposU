import simpleGit from "simple-git";
import { prepareRepo, cleanRepo } from "./repoService";
import  { normalizePath, isBinaryFile } from "../utils/contributions.utils";  

interface ContributionStats {
  [user: string]: {
    [folder: string]: { linesAdded: number; linesDeleted: number; percentage: number };
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
    console.log(" Archivos detectados con ls-files:", rawFiles);    
    const allFiles = rawFiles.split("\n").map(normalizePath).filter((f) => f !== "");

    console.log(`[DEBUG] Total archivos en el repo: ${allFiles.length}`);
    console.log(" Lista de archivos en el repo:", allFiles.slice(0, 50)); 
    console.log(" ¿docs/recursos/imagenes está en allFiles?", allFiles.includes("docs/recursos/imagenes"));
    
    const contributions: ContributionStats = {};
    const binaryFileOwners: Record<string, string> = {}; // Último usuario que modificó archivos binarios.

    const detectedFolders = new Set<string>(); // Para verificar carpetas únicas detectadas.

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

      const parts = filePath.split("/");
      parts.pop();
      const folderPath = parts.join("/");

      detectedFolders.add(folderPath);

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
      
        contributions[binaryOwner] = contributions[binaryOwner] || {};
        contributions[binaryOwner][filePath] = { linesAdded: 0, linesDeleted: 0, percentage: 100 };
        binaryFileOwners[filePath] = binaryOwner;
        console.log(`[DEBUG] Archivo binario detectado y asignado a ${binaryOwner}: ${filePath}`);
      } else {
        //  Para archivos de texto, calculamos el porcentaje normal
        for (const [user, { linesAdded, linesDeleted }] of Object.entries(userEdits)) {
          if (!contributions[user]) contributions[user] = {};
          contributions[user][filePath] = {
            linesAdded,
            linesDeleted,
            percentage: totalLinesModified > 0 ? ((linesAdded + linesDeleted) / totalLinesModified) * 100 : 0
          };
        }
      }
    }

    console.log(`[DEBUG] Carpetas detectadas en el repo (${detectedFolders.size}):`, [...detectedFolders]);
    console.log(" ¿docs/recursos/imagenes está en detectedFolders?", detectedFolders.has("docs/recursos/imagenes"));

    //  Cálculo de porcentajes para carpetas
    const folderContributions: ContributionStats = JSON.parse(JSON.stringify(contributions));
    const folderFiles: Record<string, number> = {}; // Cuenta los archivos en cada carpeta

    for (const user of Object.keys(contributions)) {
      for (const filePath of Object.keys(contributions[user])) {
        const parts = filePath.split("/");
        while (parts.length > 1) {
          parts.pop();
          const folderPath = parts.join("/");

          if (!folderContributions[user][folderPath]) {
            folderContributions[user][folderPath] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
          }

          folderContributions[user][folderPath].percentage += contributions[user][filePath].percentage;

          //  Asegurar que la carpeta se cuenta aunque solo tenga imágenes/PDFs
          if (!folderFiles[folderPath]) folderFiles[folderPath] = 0;
          folderFiles[folderPath]++;
        }
      }
    }

    console.log(" Carpetas detectadas antes de procesar contribuciones:", Object.keys(folderFiles));
    console.log(" ¿docs/recursos/imagenes está en folderFiles?", folderFiles.hasOwnProperty("docs/recursos/imagenes"));

    //  Verificar si alguna carpeta solo tiene binarios y asignar el último usuario
    Object.keys(folderFiles).forEach((folderPath) => {
      Object.keys(contributions).forEach((user) => {
        if (!folderContributions[user][folderPath]) {
          folderContributions[user][folderPath] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
        }
      });
    
      //  Si la carpeta contiene archivos binarios, asignamos el último usuario que los modificó
      const binaryOwner = Object.entries(binaryFileOwners).find(([file]) => file.startsWith(folderPath))?.[1];
      if (binaryOwner) {
        if (!folderContributions[binaryOwner][folderPath]) {
          folderContributions[binaryOwner][folderPath] = { linesAdded: 0, linesDeleted: 0, percentage: 0 };
        }
        folderContributions[binaryOwner][folderPath].percentage = 100;
        console.log(` [FIX] Agregando carpeta con binarios: ${folderPath} -> Dueño: ${binaryOwner}`);
      }
    });

    //  Normalizar para que los porcentajes no superen 100%
    for (const user of Object.keys(folderContributions)) {
      for (const folder of Object.keys(folderContributions[user])) {
        const totalPercentage = Object.values(folderContributions).reduce(
          (sum, userFolders) => sum + (userFolders[folder]?.percentage || 0),
          0
        );

        if (totalPercentage > 100) {
          for (const user of Object.keys(folderContributions)) {
            if (folderContributions[user][folder]) {
              folderContributions[user][folder].percentage =
                (folderContributions[user][folder].percentage / totalPercentage) * 100;
            }
          }
        }
      }
    }

    //  Calcular contribución total de cada usuario
    const userTotals: Record<string, number> = {};

    for (const user of Object.keys(folderContributions)) {
      userTotals[user] = Object.values(folderContributions[user]).reduce(
        (sum, { percentage }) => sum + percentage,
        0
      );
    }

    //  Normalizar sobre 100
    const totalContributions = Object.values(userTotals).reduce((sum, value) => sum + value, 0);
    if (totalContributions > 0) {
      for (const user of Object.keys(userTotals)) {
        userTotals[user] = (userTotals[user] / totalContributions) * 100;
      }
    }

    //  Agregar datos al objeto `folderContributions` con clave especial "TOTAL"
    for (const user of Object.keys(userTotals)) {
      if (!folderContributions[user]) folderContributions[user] = {};
      folderContributions[user]["TOTAL"] = {
        linesAdded: 0,  // No aplicable
        linesDeleted: 0, // No aplicable
        percentage: userTotals[user],
      };
    }

    console.log("  Datos de TOTAL agregados:", folderContributions);
    console.log(" Datos completos enviados al frontend:", Object.keys(folderContributions));
    console.log(" ¿docs/recursos/imagenes está en folderContributions?", folderContributions.hasOwnProperty("docs/recursos/imagenes"));
    console.log("[DEBUG] Datos enviados al frontend (primeras 10 claves):", Object.keys(folderContributions).slice(0, 10));

    return folderContributions;
  } catch (error) {
    console.error("[ERROR] getContributionsByUser:", error);
    throw new Error("Error al calcular contribuciones.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};

