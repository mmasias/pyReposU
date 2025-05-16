import { Router } from "express";
import { getUserContributionsHandler } from "../controllers/HeatMap/heatMap.controller";
import { ensureRepoSynced } from "../middleware/ensureRepoSynced";
import { getBubbleChartHandler } from "../controllers/BubbleChart/bubbleChartController"; 

const router = Router();

router.get(
    "/",
    ensureRepoSynced({ syncCommits: true, syncStats: true, syncDiffs: false }), 
    getUserContributionsHandler
  );

    router.get(
      "/bubble-chart",
      ensureRepoSynced({ syncCommits: true, syncStats: true, syncDiffs: false }), 
      getBubbleChartHandler
    );



export default router;