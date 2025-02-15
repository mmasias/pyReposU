import simpleGit from "simple-git";
import { prepareRepo, cleanRepo, getRepoBranches } from "../../utils/gitRepoUtils";

interface BubbleChartData {
  [user: string]: {
    date: string;
    linesAdded: number;
    linesDeleted: number;
    branch: string;
    hash: string;
    message: string;
    files: string[];
  }[];
}

/**
 * Obtiene los logs de commits en una rama específica.
 */
const fetchCommitLogs = async (repoPath: string, branch: string): Promise<string[]> => {
  const git = simpleGit(repoPath);
  await git.checkout(branch);

  const logOutput = await git.raw([
    "log",
    "--format=%H;%an;%ad;%s",
    "--date=iso",
    "--numstat",
  ]);

  return logOutput.split("\n");
};

/**
 * Procesa los logs de commits y los convierte en datos estructurados.
 */
const parseCommitLogs = (lines: string[], branchName: string): BubbleChartData => {
  const bubbleData: BubbleChartData = {};
  const processedCommits = new Set<string>();

  let currentUser = "", currentDate = "", currentHash = "", currentMessage = "";
  let currentFiles: string[] = [];
  let linesAdded = 0, linesDeleted = 0;

  for (const line of lines) {
    if (line.includes(";")) {
      if (currentUser && currentHash && !processedCommits.has(currentHash)) {
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

      const [hash, author, date, message] = line.split(";");
      currentUser = author.trim();
      currentDate = date.trim();
      currentHash = hash.trim();
      currentMessage = message?.trim() || "Sin mensaje";
      currentFiles = [];
      linesAdded = 0;
      linesDeleted = 0;
    } else if (line.includes("\t")) {
      const [added, deleted, filePath] = line.split("\t");
      linesAdded += parseInt(added) || 0;
      linesDeleted += parseInt(deleted.trim()) || 0;
      currentFiles.push(filePath.trim());
    }
  }

  return bubbleData;
};

/**
 * Genera datos para el diagrama de burbujas basado en commits.
 */
export const getBubbleChartData = async (repoUrl: string, branch: string = "main"): Promise<BubbleChartData> => {
  let repoPath: string | null = null;

  try {
    repoPath = await prepareRepo(repoUrl);
    const branchesToProcess = branch === "Todas"
      ? await getRepoBranches(repoPath)
      : [branch];

    const bubbleData: BubbleChartData = {};

    for (const branchName of branchesToProcess) {
      try {
        const commitLogs = await fetchCommitLogs(repoPath, branchName);
        const branchData = parseCommitLogs(commitLogs, branchName);

        Object.entries(branchData).forEach(([user, commits]) => {
          if (!bubbleData[user]) bubbleData[user] = [];
          bubbleData[user].push(...commits);
        });
      } catch (error) {
        console.warn(`Error procesando rama ${branchName}:`, error);
      }
    }

    return bubbleData;
  } catch (error) {
    console.error("[ERROR] getBubbleChartData:", error);
    throw new Error("Error al generar datos para el diagrama de burbujas.");
  } finally {
    if (repoPath) await cleanRepo(repoPath);
  }
};
