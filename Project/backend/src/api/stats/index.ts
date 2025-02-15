// src/api/stats/stats.routes.ts
import { Router } from 'express';
import folderRoutes from './folders/folderRoutes'; 
import userRoutes from './user/UserStats.routes';
import { getRepositoryTree } from './folders/folderTree.controller'; 
import contributionsRoutes from "./contributions/contributions.routes";

const router = Router();

// Conectar las rutas de cada submódulo
router.use('/folders', folderRoutes); 
router.use('/user', userRoutes); 
router.get('/tree', getRepositoryTree); 
router.use("/contributions", contributionsRoutes);

export default router;
