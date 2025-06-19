import { Router } from 'express';
import { getCommitsHandler } from '../controllers/VisualizadorCodigo/carpetas/commits.controller';
import { getFileContentHandler} from '../controllers/VisualizadorCodigo/carpetas/getFileContent.controller';
import {analyzeDeepHandler, analyzeExpressHandler} from '../controllers/VisualizadorCodigo/archivos/fileanalysis.controller.';
import { getRepositoryTree } from '../controllers/VisualizadorCodigo/carpetas/folderTree.controller';
import { getCurrentBranch } from '../controllers/VisualizadorCodigo/carpetas/getCurrentBranch.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';
import { getFileDiffHandler } from '../controllers/VisualizadorCodigo/archivos/getFileDiff.controller';
import { getFilePlaybackHandler } from '../controllers/VisualizadorCodigo/archivos/getFilePlayback.controller';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getCommitsHandler);
router.get('/tree', ensureRepoSynced({ syncCommits: true, syncStats: true }), getRepositoryTree);
router.get('/content', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileContentHandler);
router.get('/diff', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileDiffHandler);
router.get('/analyze-express', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeExpressHandler);
router.get('/analyze-deep', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeDeepHandler);//
router.get('/playback', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), getFilePlaybackHandler);
router.get('/current-branch', ensureRepoSynced({ syncCommits: true }), getCurrentBranch);

export default router;