// src/api/stats/stats.routes.ts
import { Router } from 'express';
import folderRoutes from './folderRoutes'; 
import userRoutes from './UserStats.routes';
import { getRepositoryTree } from '../controllers/folderTree.controller';
import contributionsRoutes from "./contributions.routes";

const router = Router();

// Conectar las rutas de cada submódulo
router.use('/folders', folderRoutes); 
router.use('/user', userRoutes); 
router.get('/tree', getRepositoryTree); 
router.use("/contributions", contributionsRoutes);

export default router;
