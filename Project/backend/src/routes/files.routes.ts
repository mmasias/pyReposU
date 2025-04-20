import { Router } from 'express';
import {
  getFileContentHandler,
  getFileDiffHandler,
  getFirstCommitForFileHandler,
  getLatestCommitForFileHandler,
  getFilePlaybackHandler // 👈 la NUEVA
} from '../controllers/files.controller';
import {
  analyzeDeepHandler,
  analyzeExpressHandler
} from '../controllers/fileAnalysis.controller';

const router = Router();

router.get('/content', getFileContentHandler);          //  contenido de archivo
router.get('/diff', getFileDiffHandler);                //  diff entre dos commits
router.get('/first-commit', getFirstCommitForFileHandler); //  primer commit del archivo
router.get('/latest-commit', getLatestCommitForFileHandler); //  último commit

//  análisis con IA
router.get('/analyze-express', analyzeExpressHandler);
router.get('/analyze-deep', analyzeDeepHandler);

//playback de archivo a lo largo del tiempo
router.get('/playback', getFilePlaybackHandler);

export default router;
