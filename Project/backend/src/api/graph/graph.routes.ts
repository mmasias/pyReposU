// src/api/graph/graph.routes.ts
import { Router } from 'express';
import { getRepoGraphController } from './graph.controller';

const router = Router();

router.get('/', getRepoGraphController);

export default router;
