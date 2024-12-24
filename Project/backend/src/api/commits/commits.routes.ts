import { Router } from 'express';
import { getCommits } from './commits.controller';

const router = Router();

router.get('/', getCommits);

export default router;
