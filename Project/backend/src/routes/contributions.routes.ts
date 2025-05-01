import { Router } from "express";
import { getUserContributionsHandler, getBubbleChartHandler } from "../controllers/contributions.controller";
import { ensureRepoSynced } from "../middleware/ensureRepoSynced";

const router = Router();

router.get("/", ensureRepoSynced({ syncCommits: true, syncStats: true }), getUserContributionsHandler);
router.get("/bubble-chart", ensureRepoSynced({ syncCommits: true, syncStats: true }), getBubbleChartHandler);

export default router;
