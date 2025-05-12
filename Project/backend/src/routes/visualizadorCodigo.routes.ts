import { Router } from 'express';
import { getCommitsHandler } from '../controllers/commits.controller';
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
import { getFolderStats } from '../controllers/stats.controller';
import { getRepositoryTree, getCurrentBranch } from '../controllers/folderTree.controller';
import { ensureRepoSynced } from '../middleware/ensureRepoSynced';

const router = Router();

router.get('/', ensureRepoSynced({ syncCommits: true, syncStats: true }), getCommitsHandler);
router.get('/tree', ensureRepoSynced({ syncCommits: true, syncStats: true }), getRepositoryTree);
router.get('/content', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileContentHandler);
router.get('/diff', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFileDiffHandler);
router.get('/first-commit', ensureRepoSynced({ syncCommits: true }), getFirstCommitForFileHandler);
router.get('/latest-commit', ensureRepoSynced({ syncCommits: true }), getLatestCommitForFileHandler);
router.get('/analyze-express', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeExpressHandler);
router.get('/analyze-deep', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), analyzeDeepHandler);
router.get('/playback', ensureRepoSynced({ syncCommits: true, syncDiffs: true }), getFilePlaybackHandler);
router.get('/folder-stats', ensureRepoSynced({ syncCommits: true, syncStats: true }), getFolderStats); 
router.get('/current-branch', ensureRepoSynced({ syncCommits: true }), getCurrentBranch);

export default router;