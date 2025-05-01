import { Router } from 'express';
import { getCommitsHandler } from '../controllers/commits.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getCommitsHandler);

export default router;
