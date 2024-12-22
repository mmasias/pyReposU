import { Router } from 'express';
import { getFolderStats } from './stats.controller';

const router = Router();

// Estadísticas por carpetas
router.get('/folders', getFolderStats);


export default router;
