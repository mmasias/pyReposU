import 'dotenv/config';
import { GitService } from './core/services/git.service';
import { writeJSONFile } from './core/utils/file.util';
import { PATHS } from './core/constants/paths.constants';

(async () => {
  const gitService = new GitService();
  const repoUrl = process.env.REPO_URL || '';
  const repoPath = process.env.REPO_PATH || '';

  if (!repoUrl && !repoPath) {
    console.error('Error: Debe especificarse una REPO_URL o REPO_PATH válida en el archivo .env.');
    return;
  }

  try {
    const preparedRepoPath = await gitService.prepareRepo(repoUrl, repoPath);

    console.log('Obteniendo commits detallados...');
    const detailedCommits = await gitService.getDetailedCommits(preparedRepoPath);

    console.log('Agrupando cambios por carpeta...');
    const folderStats = await gitService.groupChangesByFolder(detailedCommits);

    await writeJSONFile(`${PATHS.OUTPUT}/detailed_commits.json`, detailedCommits);
    await writeJSONFile(`${PATHS.OUTPUT}/folder_stats.json`, folderStats);
  } catch (error) {
    console.error('Ocurrió un error:', error);
  }
})();
