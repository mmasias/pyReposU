import { Router } from "express";
import { getUserStatsHandler, exportStatsToCSV, getBranchesHandler } from "../controllers/userStats.controller";

const router = Router();

router.get("/", getUserStatsHandler);
router.get("/export/csv", exportStatsToCSV);
router.get("/branches", getBranchesHandler);

export default router;
