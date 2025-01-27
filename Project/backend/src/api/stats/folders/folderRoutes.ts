// src/api/stats/folders/stats.routes.ts
import { Router } from 'express';
import { getFolderStats, getFoldersOrdered } from './stats.controller';
import { getRepositoryTree } from './folderTree.controller';

const router = Router();

router.get('/', getFolderStats); // Estadísticas generales de carpetas
router.get('/order', getFoldersOrdered); // Carpetas ordenadas
router.get('/tree', getRepositoryTree); // Árbol de repositorio

export default router;
