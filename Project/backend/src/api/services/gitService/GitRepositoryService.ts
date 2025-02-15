import simpleGit, { SimpleGit } from "simple-git";
import { prepareRepo, cleanRepo } from "../../utils/gitUtils";
/**
 * Servicio para manejar repositorios Git.
 */
export class GitRepositoryService {
  private repoPath: string | null = null;
  private git: SimpleGit | null = null;

  constructor(private repoUrl: string) {}

  async init() {
    this.repoPath = await prepareRepo(this.repoUrl);
    this.git = simpleGit(this.repoPath);
  }

  async getCommits(): Promise<any[]> {
    if (!this.git) throw new Error("Repositorio no inicializado");
    const log = await this.git.log();

    return Promise.all(
      log.all.map(async (commit) => {
        const filesOutput = await this.git!.raw([
          "show",
          "--pretty=format:",
          "--name-only",
          commit.hash,
        ]);

        return {
          hash: commit.hash,
          message: commit.message,
          date: commit.date,
          author: commit.author_name,
          files: filesOutput.split("\n").filter((file) => file.trim() !== ""),
        };
      })
    );
  }

  async getFileContent(commitHash: string, filePath: string): Promise<string> {
    if (!this.git) throw new Error("Repositorio no inicializado");
    return await this.git.show([`${commitHash}:${filePath}`]);
  }

  async getFileDiff(commitHashOld: string, commitHashNew: string, filePath: string) {
    if (!this.git) throw new Error("Repositorio no inicializado");
  
    try {
      // Ejecutar el comando raw para obtener el diff en formato puro
      const rawDiff = await this.git.raw([
        "diff",
        `${commitHashOld}:${filePath}`,
        `${commitHashNew}:${filePath}`,
      ]);
  
      console.log("[DEBUG] Diff crudo obtenido:", rawDiff);
  
      const addedLines: string[] = [];
      const removedLines: string[] = [];
  
      // Procesar línea por línea
      const diffLines = rawDiff.split("\n");
      diffLines.forEach((line) => {
        if (line.startsWith("+") && !line.startsWith("+++")) {
          const trimmedLine = line.slice(1).replace(/\s+$/, ""); // Eliminar espacios innecesarios
          addedLines.push(trimmedLine || "\n");
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          const trimmedLine = line.slice(1).replace(/\s+$/, "");
          removedLines.push(trimmedLine || "\n");
        }
      });
  
      return { addedLines, removedLines };
    } catch (error) {
      console.error(`[getFileDiff] Error al obtener diff:`, error);
      return { addedLines: [], removedLines: [] };
    }
  }
  

  async getFirstCommitForFile(filePath: string): Promise<string | null> {
    if (!this.git) throw new Error("Repositorio no inicializado");
    const firstCommitHash = await this.git.raw([
      "log",
      "--diff-filter=A",
      "--format=%H",
      filePath,
    ]);

    return firstCommitHash.trim().split("\n")[0] || null;
  }

  async cleanup() {
    if (this.repoPath) {
      await cleanRepo(this.repoPath);
    }
  }
}
