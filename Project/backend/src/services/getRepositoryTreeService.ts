import { Commit } from "../models/Commit";
import { CommitFile } from "../models/CommitFile";
import { CommitBranch } from "../models/CommitBranch";
import { Branch } from "../models/Branch";
import { normalizePath } from "../utils/file.utils";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";

interface TreeNode {
  name: string;
  changes: number;
  files: { name: string; changes: number }[];
  subfolders: TreeNode[];
}

export const getRepositoryTreeService = async (
  repoId: number,
  filters?: {
    author?: string;
    since?: Date;
    until?: Date;
    branch?: string;
    repoUrl?: string;
  }
): Promise<TreeNode> => {
  const fileChangeMap: Record<string, number> = {};
  const filesInHead = new Set<string>();
  const branchName = filters?.branch;
  let branchId: number | undefined;

  // 🔹 1. Preparar Git local y archivos vivos
  if (filters?.repoUrl) {
    const repoPath = await prepareRepo(filters.repoUrl);
    const git = simpleGit(repoPath);

    if (branchName) {
      try {
        await git.checkout(branchName);
      } catch (err) {
        console.warn(`[TreeService] No se pudo hacer checkout a ${branchName}`, err);
      }
    }

    const output = await git.raw(["ls-files"]);
    output
      .split("\n")
      .map(normalizePath)
      .filter(Boolean)
      .forEach((path) => {
        filesInHead.add(path);
        fileChangeMap[path] = 0; // Inicializa en 0 cambios
      });
  }

  // 🔹 2. Buscar branch en DB
  if (branchName) {
    const branch = await Branch.findOne({
      where: { name: branchName, repositoryId: repoId },
    });
    if (branch) branchId = branch.id;
  }

  // 🔹 3. Buscar commits relacionados
  const commitWhere: any = {
    repositoryId: repoId,
    ...(filters?.since && { date: { gte: filters.since } }),
    ...(filters?.until && { date: { lte: filters.until } }),
  };

  const include: any[] = [];

  if (filters?.author) {
    include.push({
      association: "User",
      where: { githubLogin: filters.author },
      required: true,
    });
  }

  if (branchId) {
    const commitBranches = await CommitBranch.findAll({
      where: { branchId },
      attributes: ['commitId'],
    });

    const commitIds = commitBranches.map(cb => cb.commitId);
    if (commitIds.length === 0) return { name: "", changes: 0, files: [], subfolders: [] };
    commitWhere.id = commitIds;
  }

  const commits = await Commit.findAll({
    where: commitWhere,
    include,
  });

  if (commits.length === 0) return { name: "", changes: 0, files: [], subfolders: [] };

  const commitIds = commits.map(c => c.id);
  const commitFiles = await CommitFile.findAll({ where: { commitId: commitIds } });

  for (const file of commitFiles) {
    const path = normalizePath(file.filePath);
    if (!filesInHead.has(path)) continue;

    const changes = (file.linesAdded || 0) + (file.linesDeleted || 0);
    fileChangeMap[path] = (fileChangeMap[path] || 0) + changes;
  }

  // 🔹 4. Construcción del árbol
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

  // 🔹 5. Limpieza final del árbol
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
