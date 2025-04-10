import { Router } from 'express';
import { getFileContentHandler, getFileDiffHandler, getFirstCommitForFileHandler } from '../controllers/files.controller';
import { analyzeDeepHandler, analyzeExpressHandler } from '../controllers/fileAnalysis.controller';
import { getLatestCommitForFileHandler } from '../controllers/files.controller';

const router = Router();

router.get('/content', getFileContentHandler);
router.get('/diff', getFileDiffHandler); 
router.get('/first-commit', getFirstCommitForFileHandler);

// Análisis con IA
router.get('/analyze-express', analyzeExpressHandler);
router.get('/analyze-deep', analyzeDeepHandler);
router.get('/latest-commit', getLatestCommitForFileHandler);

export default router;
