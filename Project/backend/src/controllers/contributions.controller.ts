import { Request, Response } from "express";
import { getContributionsByUser } from "../services/contributionsService";
import { Repository } from "../models/Repository"; 
import { CommitBranch } from "../models/CommitBranch";
import { Branch } from "../models/Branch"; 
import { Commit } from "../models/Commit"; 
import { getBubbleChartData } from "../services/bubbleChartService";
import { wasProcessed } from "../services/syncState";
import { CommitBranch as CommitBranchModel } from "../models/CommitBranch";

type CommitBranchWithCommit = CommitBranchModel & {
  commit?: Commit;
};

export const getUserContributionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoUrl, branch = "main", startDate, endDate } = req.query; 

    if (!repoUrl) {
      res.status(400).json({ error: "Se requiere el parámetro repoUrl." });
      return;
    }

    // ⏳ Espera hasta que el último commit tenga stats procesadas
    const repo = await Repository.findOne({ where: { url: repoUrl } });
    if (!repo) {
      res.status(404).json({ error: "Repositorio no encontrado" });
      return;
    }

    const branchRecord = await Branch.findOne({
      where: { name: branch as string, repositoryId: repo.id },
    });

    if (!branchRecord) {
      res.status(404).json({ error: `Rama no encontrada: ${branch}` });
      return;
    }

    const latestCommitBranch = await CommitBranch.findOne({
      where: { branchId: branchRecord.id },
      include: [{ model: Commit, as: 'commit' }],
      order: [[{ model: Commit, as: 'commit' }, 'date', 'DESC']],
    }) as CommitBranchWithCommit | null;
    
    
    

    if (latestCommitBranch && latestCommitBranch.commit) {
      const hasStats = await wasProcessed(latestCommitBranch.commit.id, "stats");

      if (!hasStats) {
        res.status(202).json({
          message: "Datos aún en procesamiento. Inténtalo de nuevo en unos segundos.",
        });
        return;
      }
    }

    const contributions = await getContributionsByUser(
      repoUrl as string,
      branch as string,
      startDate as string,
      endDate as string
    );

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