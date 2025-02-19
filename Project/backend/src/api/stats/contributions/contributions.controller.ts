import { Request, Response } from "express";
import { getContributionsByUser } from "../../services/analytics/contributionsService";
import { getBubbleChartData } from "../../services/analytics/bubbleChartService";

export const getUserContributionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoUrl, branch = "main", startDate, endDate } = req.query; 

    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere el parámetro repoUrl." });
      return;
    }

    const contributions = await getContributionsByUser(repoUrl as string, branch as string, startDate as string, endDate as string);
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

    const bubbleData = await getBubbleChartData(repoUrl, branch);
    res.json(bubbleData);
  } catch (error) {
    console.error("[getBubbleChartHandler] Error:", error);
    res.status(500).json({ error: "Error al generar datos del diagrama de burbujas." });
  }
};
