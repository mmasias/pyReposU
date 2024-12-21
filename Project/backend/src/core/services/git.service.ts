import simpleGit, { SimpleGit } from 'simple-git';
import { PATHS } from '../constants/paths.constants';
import { isLocalRepoValid } from '../utils/repo.util';
import iconv from 'iconv-lite';
import { execSync } from 'child_process';


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
  
      const detailedCommits = await Promise.all(
        log.all.map(async (commit, index) => {
          const isFirstCommit = index === log.all.length - 1; // El primer commit
          const commitRange = isFirstCommit
            ? `${commit.hash}` // Solo el hash del commit
            : `${commit.hash}^..${commit.hash}`; // Rango normal para commits posteriores
  
          // Ejecutar el comando `git show` manualmente para capturar rutas sin codificar
          const rawOutput = execSync(`git show ${commitRange} --name-only --pretty=format:`, { cwd: repoPath }).toString('utf-8');
  
          // Limpiar y procesar los nombres de archivo
          const decodedFiles = rawOutput
            .split('\n')
            .filter((file) => file.trim() !== '') // Eliminar líneas vacías
            .map((file) => decodeURIComponent(escape(file.trim()))); // Decodificar caracteres escapados
  
          return {
            hash: commit.hash,
            message: commit.message,
            date: commit.date,
            author: commit.author_name,
            files: decodedFiles,
          };
        })
      );
  
      return detailedCommits;
    } catch (error) {
      console.error('Error obteniendo commits detallados:', error);
      throw error;
    }
  }
}
