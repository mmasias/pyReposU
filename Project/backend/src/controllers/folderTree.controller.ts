import { Request, Response } from "express";
import { Repository } from "../models/Repository";
import { getRepositoryTreeService } from "../services/getRepositoryTreeService";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";

export const getRepositoryTree = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, author, since, until, branch } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
    return;
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repo = await Repository.findOne({ where: { url: decodedRepoUrl } });

    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
    }

    let branchToUse = branch as string | undefined;

    //  Validamos que la rama exista en Git si se especifica
    if (branchToUse) {
      const repoPath = await prepareRepo(decodedRepoUrl);
      const git = simpleGit(repoPath);
      const branchExists = (await git.branch(["-a"])).all.some((b) =>
        b.replace("remotes/origin/", "").trim() === branchToUse
      );

      if (!branchExists) {
        res.status(400).json({ message: `La rama '${branchToUse}' no existe en el repositorio.` });
      }
    }

    const tree = await getRepositoryTreeService(repo.id, {
      author: author as string,
      since: since ? new Date(since as string) : undefined,
      until: until ? new Date(until as string) : undefined,
      repoUrl: decodedRepoUrl,
      branch: branchToUse,
    });

    if (author && (!tree.files?.length && !tree.subfolders?.length)) {
      res.status(200).json({
        warning: `No hay commits realizados por el autor '${author}'.`,
        tree: [],
      });
      return;
    }

    res.status(200).json({ tree });
  } catch (error) {
    console.error("[getRepositoryTree] Error:", error);
    res.status(500).json({
      message: "Error al obtener el árbol del repositorio.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getCurrentBranch = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
    return;
  }

  try {
    const decodedRepoUrl = decodeURIComponent(repoUrl as string);
    const repoPath = await prepareRepo(decodedRepoUrl);
    const git = simpleGit(repoPath);

    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    res.status(200).json({ currentBranch: branch.trim() });
  } catch (err) {
    console.error("Error al obtener la rama actual:", err);
    res.status(500).json({ message: "Error al obtener la rama actual." });
  }
};
