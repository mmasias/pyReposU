import { Router } from "express";
import { getUserStatsHandler, exportStatsToCSV, getBranchesHandler } from "../controllers/userStats.controller";
import { ensureRepoSynced } from "../middleware/ensureRepoSynced";

const router = Router();

router.get("/", ensureRepoSynced({ syncCommits: true, syncStats: true, syncGithubActivityOption: true }), getUserStatsHandler);
router.get("/export/csv", ensureRepoSynced({ syncCommits: true, syncStats: true, syncGithubActivityOption: true }), exportStatsToCSV);
router.get("/branches", ensureRepoSynced({ syncCommits: true }), getBranchesHandler);

export default router;