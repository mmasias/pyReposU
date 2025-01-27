// src/api/stats/user/userStats.routes.ts
import { Router } from "express";
import { getUserStatsHandler, exportStatsToCSV } from "./userStats.controller";

const router = Router();

router.get("/", getUserStatsHandler);
router.get("/export/csv", exportStatsToCSV);

export default router;
