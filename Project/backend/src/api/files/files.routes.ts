import { Router } from 'express';
import { getFileContent, getFileDiff } from './files.controller';

const router = Router();

router.get('/content', getFileContent);
router.get('/diff', getFileDiff); 

export default router;
