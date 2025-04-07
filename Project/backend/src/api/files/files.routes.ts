import { Router } from 'express';
import { getFileContentHandler, getFileDiffHandler, getFirstCommitForFileHandler } from './files.controller';
import { analyzeDeepHandler, analyzeExpressHandler } from './fileAnalysis.controller';
import { getLatestCommitForFileHandler } from './files.controller';

const router = Router();

router.get('/content', getFileContentHandler);
router.get('/diff', getFileDiffHandler); 
router.get('/first-commit', getFirstCommitForFileHandler);

// Análisis con IA
router.get('/analyze-express', analyzeExpressHandler);
router.get('/analyze-deep', analyzeDeepHandler);
router.get('/latest-commit', getLatestCommitForFileHandler);

export default router;
