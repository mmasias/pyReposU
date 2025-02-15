import { Router } from 'express';
import { getFileContentHandler, getFileDiffHandler, getFirstCommitForFileHandler } from './files.controller';

const router = Router();

router.get('/content', getFileContentHandler);
router.get('/diff', getFileDiffHandler); 
router.get('/first-commit', getFirstCommitForFileHandler);

export default router;
