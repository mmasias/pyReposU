import simpleGit, { SimpleGit } from 'simple-git';
import { execSync } from 'child_process';
import { PATHS } from '../constants/paths.constants';
import { isLocalRepoValid } from '../utils/repo.util';
import iconv from 'iconv-lite'; 

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

  async getDetailedCommits(repoPath: string) {
    this.git = simpleGit(repoPath);
    try {
      const log = await this.git.log();
  
      const detailedCommits = await Promise.all(
        log.all.map(async (commit) => {
          try {
            const rawOutput = execSync(
              `git diff-tree --no-commit-id --name-only -r ${commit.hash}`,
              { cwd: repoPath, encoding: 'utf-8' }
            ).toString();
  
            // Procesar los nombres de archivo
            const cleanedFiles = rawOutput
              .split('\n')
              .filter((file) => file.trim() !== '') // Eliminar líneas vacías
              .map((file) => this.replaceUtf8Sequences(file.trim())); // Reemplazar secuencias UTF-8
  
            return {
              hash: commit.hash,
              message: commit.message,
              date: commit.date,
              author: commit.author_name,
              files: cleanedFiles,
            };
          } catch (error) {
            console.error(`Error procesando archivos para el commit ${commit.hash}:`, error);
            return {
              hash: commit.hash,
              message: commit.message,
              date: commit.date,
              author: commit.author_name,
              files: [], // En caso de error, devolver lista vacía
            };
          }
        })
      );
  
      return detailedCommits;
    } catch (error) {
      console.error('Error obteniendo commits detallados:', error);
      throw error;
    }
  }

  /**
   * Limpia y normaliza las rutas de archivo.
   * @param filePath Ruta original del archivo.
   * @returns Ruta limpia y normalizada.
   */
  private cleanFilePath(filePath: string): string {
    // Eliminar comillas escapadas
    let cleanedPath = filePath.replace(/^"+|"+$/g, '');

    // Normalizar slashes y decodificar caracteres especiales
    cleanedPath = cleanedPath.replace(/\\/g, '/');
    cleanedPath = decodeURIComponent(escape(cleanedPath));

    return cleanedPath.trim();
  }

  async groupChangesByFolder(detailedCommits: any[]) {
    const folderStats: Record<string, { totalChanges: number; files: Record<string, number> }> = {};

    detailedCommits.forEach((commit) => {
      commit.files.forEach((filePath: string) => {
        // Normalizar las rutas y extraer la carpeta principal
        const normalizedPath = filePath.replace(/\\/g, '/'); // Reemplazar backslashes por slashes
        const folder = normalizedPath.split('/')[0]; // Extraer carpeta principal

        // Inicializar estadísticas para la carpeta
        if (!folderStats[folder]) {
          folderStats[folder] = { totalChanges: 0, files: {} };
        }

        // Incrementar estadísticas
        folderStats[folder].totalChanges += 1;
        folderStats[folder].files[normalizedPath] = (folderStats[folder].files[normalizedPath] || 0) + 1;
      });
    });

    return folderStats;
  }

  //función para el manejo de palabras que no estan parseando bien con iconv-lite y decodeURIComponent
  private replaceUtf8Sequences(filePath: string): string {
    // Mapeo de secuencias UTF-8 escapadas a caracteres
    const replacements: Record<string, string> = {
      '\\303\\241': 'á',
      '\\303\\251': 'é',
      '\\303\\255': 'í',
      '\\303\\263': 'ó',
      '\\303\\272': 'ú',
      '\\303\\261': 'ñ',
      '\\303\\200': 'À',
      '\\303\\211': 'É',
      '\\303\\221': 'Í',
      '\\303\\223': 'Ó',
      '\\303\\232': 'Ú',
      '\\302\\241': '¡',
      '\\302\\277': '¿'
    };
  
    // Reemplazar secuencias manualmente
    let cleanedPath = filePath;
    for (const [sequence, char] of Object.entries(replacements)) {
      cleanedPath = cleanedPath.split(sequence).join(char);
    }
  
    return cleanedPath;
  }
}