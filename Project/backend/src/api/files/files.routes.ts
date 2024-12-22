import { Router } from 'express';
import { getFileContent, getFileDiff, getFirstCommitForFile } from './files.controller';

const router = Router();

router.get('/content', getFileContent);
router.get('/diff', getFileDiff); 
router.get('/first-commit', getFirstCommitForFile);

export default router;
