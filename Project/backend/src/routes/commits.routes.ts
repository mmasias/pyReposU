import { Router } from 'express';
import { getCommitsHandler } from '../controllers/commits.controller';

const router = Router();

router.get('/', getCommitsHandler);

export default router;
