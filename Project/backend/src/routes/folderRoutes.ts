import { Router } from 'express';
import { getFolderStats, getFoldersOrdered } from '../controllers/stats.controller';
import { getRepositoryTree, getCurrentBranch } from '../controllers/folderTree.controller'; 

const router = Router();

router.get('/', getFolderStats); // Estadísticas generales de carpetas
router.get('/order', getFoldersOrdered); // Carpetas ordenadas
router.get('/tree', getRepositoryTree); // Árbol de repositorio
router.get('/current-branch', getCurrentBranch);

export default router;
