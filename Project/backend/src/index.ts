
import dotenv from 'dotenv';
import path from 'path';
import { GitService } from './core/services/git.service';
import { writeJSONFile } from './core/utils/file.util';
import { PATHS } from './core/constants/paths.constants';

dotenv.config({ path: path.resolve(__dirname, '../.env') });


(async () => {
    const gitService = new GitService();
    const repoUrl = process.env.REPO_URL || '';
    const repoPath = process.env.REPO_PATH || '';
    if (!repoUrl && !repoPath) {
      console.error('Error: Debe especificarse una REPO_URL o REPO_PATH válida en el archivo .env.');
      return;
    }
  
    try {
      // Preparar el repositorio (clonar si es necesario)
      const preparedRepoPath = await gitService.prepareRepo(repoUrl, repoPath);
  
      // Obtener los commits
      console.log('Obteniendo commits...');
      const detailedCommits = await gitService.getDetailedCommits(preparedRepoPath);
      console.log(`Commits detallados obtenidos: ${detailedCommits.length}`);
  
      // Guardar los datos en un archivo JSON
      const outputPath = `${PATHS.OUTPUT}/detailed_commits.json`;
      await writeJSONFile(outputPath, detailedCommits);
    } catch (error) {
      console.error('Ocurrió un error:', error);
    }
  })();
  
