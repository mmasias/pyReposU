import { Router } from 'express';
import { getRepoGraphController } from '../controllers/graph.controller';

const router = Router();

router.get('/', getRepoGraphController);

export default router;
