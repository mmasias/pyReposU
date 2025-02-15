import { Request, Response } from "express";
import { getCommits } from "../utils/gitUtils";

//TODO REVISAR HANDLER?
export const getCommitsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    if (!repoUrl) {
      res.status(400).json({ message: "Se requiere el parámetro repoUrl." });
      return;
    }

    const commits = await getCommits(repoUrl);
    res.status(200).json(commits);
  } catch (error) {
    console.error("[getCommitsHandler] Error:", error);
    res.status(500).json({ message: "Error al obtener commits." });
  }
};
