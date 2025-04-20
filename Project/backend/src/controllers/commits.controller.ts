import { Request, Response } from "express";
import { syncRepoIfNeeded } from "../services/syncService";
import { getCommits as getCommitsFromDb } from "../services/commitsService";

export const getCommitsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
      return;
    }

    // Sincronización selectiva solo para commits + stats
    await syncRepoIfNeeded(repoUrl, {
      syncCommits: true,
      syncDiffs: false,
      syncStats: true,
      syncGithubActivityOption: false,
    });

    const commits = await getCommitsFromDb(repoUrl);

    res.status(200).json(commits);
  } catch (error) {
    console.error("[getCommitsHandler] Error:", error);
    res.status(500).json({ message: "Error al obtener commits." });
  }
};
