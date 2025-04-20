import { Request, Response } from "express";
import { Repository } from "../models/Repository";
import { getFolderStatsService } from "../services/getFolderStatsService";
import { getFoldersOrderedService } from "../services/getFoldersOrderedService";

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

    const stats = await getFolderStatsService(repo.id);
    res.status(200).json(stats);
  } catch (error) {
    console.error("[getFolderStats] Error:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas de carpetas.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getFoldersOrdered = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, author, dateRangeStart, dateRangeEnd } = req.query;

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

    const ordered = await getFoldersOrderedService(repo.id, {
      author: author as string,
      since: dateRangeStart ? new Date(dateRangeStart as string) : undefined,
      until: dateRangeEnd ? new Date(dateRangeEnd as string) : undefined,
    });

    res.status(200).json(ordered);
  } catch (error) {
    console.error("[getFoldersOrdered] Error:", error);
    res.status(500).json({
      message: "Error al obtener carpetas ordenadas.",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
