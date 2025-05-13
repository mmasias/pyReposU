import { Router } from 'express';
import { getRepoGraphController } from '../controllers/graph.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getRepoGraphController);

export default router;