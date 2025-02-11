import { Request, Response } from "express";
import { GitRepositoryService } from "../services/GitRepositoryService";

export const getCommits = async (req: Request, res: Response): Promise<void> => {
  const repoUrl = req.query.repoUrl as string | undefined;

  if (!repoUrl) {
    res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
    return;
  }

  const gitService = new GitRepositoryService(repoUrl);

  try {
    await gitService.init();
    const commits = await gitService.getCommits();
    res.status(200).json(commits);
  } catch (error) {
    console.error(`[getCommits] Error:`, error);
    res.status(500).json({ message: "Error al obtener commits." });
  } finally {
    await gitService.cleanup();
  }
};
