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

  // 1. Preparar Git y obtener archivos vivos en HEAD
  if (filters?.repoUrl) {
    const repoPath = await prepareRepo(filters.repoUrl);
    const git = simpleGit(repoPath);

    if (branchName) {
      try {
        await git.checkout(branchName);
      } catch (err) {
        console.warn(`[getRepositoryTreeService] No se pudo hacer checkout a ${branchName}`, err);
      }
    }

    const output = await git.raw(["ls-files"]);
    output
      .split("\n")
      .map(normalizePath)
      .filter(Boolean)
      .forEach((path) => {
        filesInHead.add(path);
        fileChangeMap[path] = 0; //  Inicializar todos los archivos con 0 cambios
      });
  }

  // 2. Si viene branch, buscar su ID
  if (branchName) {
    const branchModel = await Branch.findOne({
      where: { name: branchName, repositoryId: repoId },
    });
    if (branchModel) {
      branchId = branchModel.id;
    }
  }

  // 3. Buscar commits asociados al branch (si lo hay)
  const commitWhere: any = {
    repositoryId: repoId,
    ...(filters?.author && { "$User.githubLogin$": filters.author }),
    ...(filters?.since && { date: { gte: filters.since } }),
    ...(filters?.until && { date: { lte: filters.until } }),
  };

  let commitIds: number[] = [];

  if (branchId) {
    const commitBranches = await CommitBranch.findAll({
      where: { branchId },
      attributes: ['commitId'],
    });
  
    commitIds = commitBranches.map(cb => cb.commitId);
  
    if (commitIds.length === 0) {
      console.warn(`[debug] No hay commits enlazados a esta rama (branchId: ${branchId})`);
      return { name: "", changes: 0, files: [], subfolders: [] };
    }
  
    commitWhere.id = commitIds;
  }
  
  const commits = await Commit.findAll({
    where: commitWhere,
    include: ['User'],
  });
  
  
  console.log(`[debug] commits encontrados:`, commits.length);
  console.log(`[debug] branchId aplicado:`, branchId);

  

  commitIds = commits.map(c => c.id);

  const commitFiles = await CommitFile.findAll({
    where: { commitId: commitIds },
  });

  //  Sumar cambios solo si están vivos en HEAD
  for (const file of commitFiles) {
    const path = normalizePath(file.filePath);
    const changes = (file.linesAdded || 0) + (file.linesDeleted || 0);

    if (filesInHead.has(path)) {
      fileChangeMap[path] = (fileChangeMap[path] || 0) + changes;
    }
  }

  // 4. Construcción de árbol
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
