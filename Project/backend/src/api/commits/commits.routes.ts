import { Router } from 'express';
import { getCommitsHandler } from './commits.controller';

const router = Router();

router.get('/', getCommitsHandler);

export default router;
