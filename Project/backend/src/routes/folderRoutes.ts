import { Router } from 'express';
import { getFolderStats } from '../controllers/stats.controller';
import { getRepositoryTree, getCurrentBranch } from '../controllers/folderTree.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFolderStats);
router.get('/current-branch', ensureRepoSynced({ syncCommits: true }), getCurrentBranch);

export default router;
