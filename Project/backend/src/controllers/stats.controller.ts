import { Request, Response } from "express";
import { Repository } from "../models/Repository";
import { getFolderStatsService } from "../services/getFolderStatsService";

export const getFolderStats = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl } = req.query;

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

    const stats = await getFolderStatsService(repo.id, decodedRepoUrl);
    res.status(200).json(stats);
  } catch (error) {
    console.error("[getFolderStats] Error:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas de carpetas.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
