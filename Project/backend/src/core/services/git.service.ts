import simpleGit, { SimpleGit } from 'simple-git';
import { PATHS } from '../constants/paths.constants';
import { isLocalRepoValid } from '../utils/repo.util';

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async prepareRepo(repoUrl?: string, localPath?: string): Promise<string> {
    if (localPath && isLocalRepoValid(localPath)) {
      console.log(`Repositorio local encontrado en: ${localPath}`);
      return localPath;
    }

    if (!repoUrl) {
      throw new Error('Debe especificarse una REPO_URL o REPO_PATH válida.');
    }

    console.log(`Clonando repositorio desde: ${repoUrl}...`);
    try {
      const clonePath = PATHS.TEMP_REPO;
      await this.git.clone(repoUrl, clonePath);
      console.log('Repositorio clonado exitosamente.');
      return clonePath;
    } catch (error) {
      console.error('Error al clonar el repositorio:', error);
      throw error;
    }
  }

  async getCommits(repoPath: string) {
    this.git = simpleGit(repoPath);
    try {
      const log = await this.git.log();
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        date: commit.date,
        author: commit.author_name,
        files: [], // Se llenará con más detalles en futuras iteraciones
      }));
    } catch (error) {
      console.error('Error obteniendo commits:', error);
      throw error;
    }
  }

  async getDetailedCommits(repoPath: string) {
    this.git = simpleGit(repoPath);
  
    try {
      const log = await this.git.log();
  
      // Procesar cada commit para obtener archivos modificados
      const detailedCommits = await Promise.all(
        log.all.map(async (commit) => {
          try {
            const files = await this.git.show([commit.hash, '--name-only', '--pretty=format:']);
            return {
              hash: commit.hash,
              message: commit.message,
              date: commit.date,
              author: commit.author_name,
              files: files.split('\n').filter((file) => file.trim() !== ''),
            };
          } catch (error) {
            console.error(`Error procesando commit ${commit.hash}:`, error);
            return null; // Ignorar commits problemáticos
          }
        })
      );
  
      // Filtrar commits válidos
      return detailedCommits.filter((commit) => commit !== null);
    } catch (error) {
      console.error('Error obteniendo commits detallados:', error);
      throw error;
    }
  }
  
}
