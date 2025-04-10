import { Router } from "express";
import { getUserContributionsHandler, getBubbleChartHandler } from "../controllers/contributions.controller";

const router = Router();

//  Endpoint para obtener el mapa de calor de contribuciones
router.get("/", getUserContributionsHandler);

//  Endpoint para obtener los datos del diagrama de burbujas
router.get("/bubble-chart", getBubbleChartHandler);

export default router;
