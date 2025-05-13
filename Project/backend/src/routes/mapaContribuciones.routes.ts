import { Router } from "express";
import { getUserContributionsHandler, getBubbleChartHandler } from "../controllers/contributions.controller";
import { ensureRepoSynced } from "../middleware/ensureRepoSynced";

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