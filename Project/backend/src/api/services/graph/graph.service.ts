import simpleGit from "simple-git";
import path from "path";
import { prepareRepo } from "../../utils/gitRepoUtils";

interface CommitNode {
  hash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  branches: string[];
  isMerge: boolean;
}

interface BranchNode {
  name: string;
  head: string;
}

export const getGraphDataForRepo = async (repoUrl: string): Promise<{
  commits: CommitNode[];
  branches: BranchNode[];
}> => {
  const repoPath = await prepareRepo(repoUrl);
  const git = simpleGit(repoPath);

  // Obtener commits completos con info de los padres
  const rawCommits = await git.raw([
    "log",
    "--all",
    "--pretty=format:%H|%P|%an|%ad|%s",
    "--date=iso"
  ]);

  const commits: CommitNode[] = rawCommits
    .split("\n")
    .map((line) => {
      const [hash, parentsStr, author, date, ...msgParts] = line.split("|");
      const message = msgParts.join("|").trim(); // por si el mensaje tiene "|"
      const parents = parentsStr ? parentsStr.trim().split(" ") : [];
      return {
        hash,
        message,
        author,
        date,
        parents,
        branches: [],
        isMerge: parents.length > 1
      };
    });

  // Obtener ramas remotas
  const branchInfo = await git.branch(["-r"]);
  const branches: BranchNode[] = [];

  for (const rawName of branchInfo.all) {
    const name = rawName.replace("origin/", "").trim();
    if (name === "HEAD") continue;

    const branchHash = await git.revparse([rawName]);
    branches.push({ name, head: branchHash });

    // Añadimos la rama al commit correspondiente
    const commit = commits.find((c) => c.hash === branchHash);
    if (commit) {
      commit.branches.push(name);
    }
  }

  return { commits, branches };
};
