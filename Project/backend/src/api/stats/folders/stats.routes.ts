import { Router } from 'express';
import { getFolderStats, getFoldersOrdered  } from './stats.controller';
import { getRepositoryTree } from './folderTree.controller';

const router = Router();

// Estadísticas por carpetas
router.get('/folders', getFolderStats);
router.get('/folders/order', getFoldersOrdered);
router.get('/tree', getRepositoryTree);


export default router;
