import { Router } from 'express';
import {
  getFileContentHandler,
  getFileDiffHandler,
  getFirstCommitForFileHandler,
  getLatestCommitForFileHandler,
  getFilePlaybackHandler
} from '../controllers/files.controller';
import {
  analyzeDeepHandler,
  analyzeExpressHandler
} from '../controllers/fileAnalysis.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

// Todas estas rutas dependen del repo local
router.get('/content', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileContentHandler);
router.get('/diff', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileDiffHandler);
router.get('/first-commit', ensureRepoSynced({ syncCommits: true }), getFirstCommitForFileHandler);
router.get('/latest-commit', ensureRepoSynced({ syncCommits: true }), getLatestCommitForFileHandler);

router.get('/analyze-express', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeExpressHandler);
router.get('/analyze-deep', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeDeepHandler);

router.get('/playback', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), getFilePlaybackHandler);

export default router;
