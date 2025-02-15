import { Request, Response } from "express";
import { getCommitsService } from "../services/commitsService";

export const getCommits = async (req: Request, res: Response): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string | undefined;
    if (!repoUrl) {
      res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
      return;
    }

    const commits = await getCommitsService(repoUrl);
    res.status(200).json(commits);
  } catch (error) {
    console.error("[getCommits] Error:", error);
    res.status(500).json({ message: "Error al obtener commits." });
  }
};
