import { getPlaybackHistory } from "../services/filePlayback.service";
import { Request, Response } from "express";

export const getFilePlaybackHandler = async (req: Request, res: Response) => {
  const { repoUrl, branch, filePath } = req.query;

  if (!repoUrl || !branch || !filePath) {
    res.status(400).json({ message: "Faltan parámetros: repoUrl, branch, filePath" });
    return;
  }

  try {
    const data = await getPlaybackHistory(
      repoUrl as string,
      branch as string,
      filePath as string
    );

    res.status(200).json(data);
  } catch (err) {
    console.error("[getFilePlaybackHandler]", err);
    res.status(500).json({ message: "Error al obtener historial del archivo." });
  }
};
