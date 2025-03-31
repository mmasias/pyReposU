import { Request, Response } from "express";
import { getGraphDataForRepo } from "../services/graph/graph.service";

export const getRepoGraphController = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing ?url param" });
    return;
  }

  try {
    const graph = await getGraphDataForRepo(url);
    res.json(graph);
  } catch (err) {
    console.error("[getRepoGraphController]", err);
    res.status(500).json({ error: "Failed to get repo graph" });
  }
};
