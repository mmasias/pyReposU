import { Request, Response } from "express";
import { getUserContributions, getBubbleChart } from "../../services/contributionsServiceHandler";

export const getUserContributionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "main";

    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere el parámetro repoUrl." });
      return;
    }

    const contributions = await getUserContributions(repoUrl, branch);
    res.json(contributions);
  } catch (error) {
    console.error("[getUserContributionsHandler] Error:", error);
    res.status(500).json({ error: "Error al obtener contribuciones de usuarios." });
  }
};

export const getBubbleChartHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const repoUrl = req.query.repoUrl as string;
    const branch = (req.query.branch as string) || "main";

    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere el parámetro repoUrl." });
      return;
    }

    const bubbleData = await getBubbleChart(repoUrl, branch);
    res.json(bubbleData);
  } catch (error) {
    console.error("[getBubbleChartHandler] Error:", error);
    res.status(500).json({ error: "Error al generar datos del diagrama de burbujas." });
  }
};
