import { Router } from 'express';
import { getFileContent } from './files.controller';

const router = Router();

/**
 * Rutas relacionadas con archivos.
 */
router.get('/content', getFileContent);

export default router;
