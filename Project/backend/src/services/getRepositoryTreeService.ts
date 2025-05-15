import { Commit } from "../models/Commit";
import { CommitFile } from "../models/CommitFile";
import { CommitBranch } from "../models/CommitBranch";
import { Branch } from "../models/Branch";
import { normalizePath as baseNormalizePath } from "../utils/file.utils";
import simpleGit from "simple-git";
import { spawn } from "child_process";
import { Op } from "sequelize";

interface TreeNode {
  name: string;
  changes: number;
  files: { name: string; changes: number }[];
  subfolders: TreeNode[];
}

const normalizePath = (input: string): string =>
  baseNormalizePath(input)
    .replace(/\\/g, "/")
    .replace(/^\.\/|^\//, "")
    .replace(/\s+$/, "")
    .trim();

export const getRepositoryTreeService = async (
  repoId: number,
  filters?: {
    author?: string;
    since?: Date;
    until?: Date;
    branch?: string;
    repoUrl?: string;
    repoPath?: string;
  }
): Promise<TreeNode> => {
  const fileChangeMap: Record<string, number> = {};
  const filesInHead = new Set<string>();
  const branchName = filters?.branch;
  let branchId: number | undefined;

  if (filters?.repoUrl) {
    const repoPath = filters.repoPath!;
    const git = simpleGit(repoPath);

    if (branchName) {
      try {
        await new Promise<void>((resolve, reject) => {
          const checkout = spawn("git", ["checkout", branchName], {
            cwd: repoPath,
            env: { ...process.env, GIT_LFS_SKIP_SMUDGE: "1" },
          });

          checkout.stderr.on("data", (data) =>
            console.error(`[git-checkout stderr] ${data}`)
          );
          checkout.on("error", reject);
          checkout.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`git checkout failed with code ${code}`));
          });
        });
      } catch (err) {
        console.warn(`[TreeService] No se pudo hacer checkout a ${branchName}`, err);
      }
    }

    const output = await git.raw(["ls-files"]);
    const rawFiles = output.split("\n").filter(Boolean);

    rawFiles.forEach((path) => {
      const normalized = normalizePath(path);
      filesInHead.add(normalized);
      fileChangeMap[normalized] = 0;
    });

    console.log("[🔍 DEBUG] filesInHead (actuales en HEAD):", [...filesInHead]);
  }

  if (branchName) {
    const branch = await Branch.findOne({
      where: { name: branchName, repositoryId: repoId },
    });
    if (branch) branchId = branch.id;
  }

  const commitWhere: any = {
    repositoryId: repoId,
    ...(filters?.since && { date: { [Op.gte]: filters.since } }),
    ...(filters?.until && { date: { ...(filters?.since ? { [Op.gte]: filters.since } : {}), [Op.lte]: filters.until } }),
  };

  const include: any[] = [];

  if (filters?.author) {
    include.push({
      association: "User",
      where: { githubLogin: filters.author },
      required: true,
    });
  }

  let commits: Commit[] = [];

  if (branchId) {
    const commitBranches = await CommitBranch.findAll({
      where: { branchId },
      attributes: ["commitId"],
    });

    const allCommitIds = commitBranches.map((cb) => cb.commitId);
    console.log(`[🔗 BRANCH] Commits asociados a '${branchName}': ${allCommitIds.length}`);

    if (allCommitIds.length === 0) {
      console.warn(`[⚠️ TREE] No hay commits en DB para la rama '${branchName}'`);
      return { name: "", changes: 0, files: [], subfolders: [] };
    }

    if (filters?.since || filters?.until) {
      const dateRange: any = {};
      if (filters.since) dateRange[Op.gte] = filters.since;
      if (filters.until) dateRange[Op.lte] = filters.until;

      commits = await Commit.findAll({
        where: {
          id: allCommitIds,
          repositoryId: repoId,
          date: dateRange,
        },
        include,
      });

      console.log("[🧪 FECHA-FIX] Total commits en rango:", commits.length);
    } else {
      // Si no hay filtros de fecha, usamos todos los commits asociados a la rama
      commits = await Commit.findAll({
        where: {
          id: allCommitIds,
          repositoryId: repoId,
        },
        include,
      });
    }
  } else {
    // Sin branch específico, buscamos por repo + fechas + autor
    commits = await Commit.findAll({
      where: commitWhere,
      include,
    });
  }

  if (!commits.length) {
    console.warn(`[🔇 TREE] No hay commits encontrados en DB para los filtros.`);
    return { name: "", changes: 0, files: [], subfolders: [] };
  }

  const commitIds = commits.map((c) => c.id);
  const commitFiles = await CommitFile.findAll({ where: { commitId: commitIds } });

  console.log(`[📦 DEBUG] commitFiles encontrados: ${commitFiles.length}`);
  const skipped: string[] = [];

  for (const file of commitFiles) {
    const path = normalizePath(file.filePath);
    if (!filesInHead.has(path)) {
      skipped.push(path);
      continue;
    }

    const changes = (file.linesAdded || 0) + (file.linesDeleted || 0);
    fileChangeMap[path] = (fileChangeMap[path] || 0) + changes;
  }

  console.log(`[📂 DEBUG] Total archivos válidos: ${Object.keys(fileChangeMap).length}`);
  if (skipped.length) {
    console.warn(
      `[⚠️ OMITIDOS] Archivos en commits pero NO en HEAD:`,
      skipped.slice(0, 10),
      skipped.length > 10 ? `...y ${skipped.length - 10} más` : ""
    );
  }

  const root: TreeNode = { name: "", changes: 0, files: [], subfolders: [] };

  for (const path in fileChangeMap) {
    const parts = path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current.files.push({ name: part, changes: fileChangeMap[path] });
      } else {
        let next = current.subfolders.find((s) => s.name === part);
        if (!next) {
          next = { name: part, changes: 0, files: [], subfolders: [] };
          current.subfolders.push(next);
        }
        next.changes += fileChangeMap[path];
        current = next;
      }
    });
  }

  const cleanTree = (node: TreeNode): TreeNode | null => {
    const cleanedSubfolders = node.subfolders
      .map(cleanTree)
      .filter((sub): sub is TreeNode => sub !== null);

    const hasFiles = node.files.length > 0;
    const hasSubfolders = cleanedSubfolders.length > 0;

    if (!hasFiles && !hasSubfolders) return null;

    return {
      ...node,
      subfolders: cleanedSubfolders,
    };
  };

  return cleanTree(root) || { name: "", changes: 0, files: [], subfolders: [] };
};
