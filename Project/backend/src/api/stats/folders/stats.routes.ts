import { Router } from 'express';
import { getFolderStats, getFoldersOrdered  } from './stats.controller';

const router = Router();

// Estadísticas por carpetas
router.get('/folders', getFolderStats);
router.get('/folders/order', getFoldersOrdered);


export default router;
