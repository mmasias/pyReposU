import { Router } from 'express';
import { getFolderStats, getFoldersOrdered } from '../controllers/stats.controller';
import { getRepositoryTree, getCurrentBranch } from '../controllers/folderTree.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFolderStats);
router.get('/order', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFoldersOrdered);
router.get('/tree', ensureRepoSynced({ syncCommits: true, syncStats: true }), getRepositoryTree);
router.get('/current-branch', ensureRepoSynced({ syncCommits: true }), getCurrentBranch);

export default router;
