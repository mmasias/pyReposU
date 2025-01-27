// src/api/stats/stats.routes.ts
import { Router } from 'express';
import folderRoutes from './folders/folderRoutes'; 
import userRoutes from './user/UserStats.routes';

const router = Router();

// Conectar las rutas de cada submódulo
router.use('/folders', folderRoutes); // Rutas de estadísticas por carpetas
router.use('/user', userRoutes); // Rutas de estadísticas por usuario

export default router;
