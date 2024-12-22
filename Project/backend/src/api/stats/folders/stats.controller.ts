import { Request, Response } from 'express';
import simpleGit from 'simple-git';
import { PATHS } from '../../constants/path.constants';
import { removeDirectory, normalizePath } from '../../utils/file.utils';

export const getFolderStats = async (req: Request, res: Response): Promise<void> => {
    const repoPath = req.query.repoPath as string;
    const repoUrl = req.query.repoUrl as string;
  
    if (!repoPath && !repoUrl) {
      res.status(400).json({
        message: 'Se requiere el parámetro repoPath (local) o repoUrl (remoto).',
      });
      return;
    }
  
    let finalRepoPath = repoPath;
  
    try {
      if (repoUrl) {
        const git = simpleGit();
        finalRepoPath = `${PATHS.TEMP_REPO}/cloned-repo`;
        await git.clone(repoUrl, finalRepoPath);
      }
  
      const git = simpleGit(finalRepoPath);
      const log = await git.log();
  
      const folderStats: Record<string, { totalChanges: number; files: Record<string, number> }> = {};
  
      for (const commit of log.all) {
        const diffTree = await git.raw(['diff-tree', '--no-commit-id', '--name-only', '-r', commit.hash]);
        const files = diffTree.split('\n').filter(file => file);

        files.forEach(file => {
            const normalizedFile = normalizePath(file);
            const folder = normalizePath(file.split('/')[0]).replace(/^"(.*)"$/, '$1');

          
            if (!folderStats[folder]) {
              folderStats[folder] = { totalChanges: 0, files: {} };
            }
          
            folderStats[folder].totalChanges += 1;
            folderStats[folder].files[normalizedFile] = (folderStats[folder].files[normalizedFile] || 0) + 1;
          
            console.log(`Archivo: ${file} | Normalizado: ${normalizedFile}`);
          });
          
          
          
      }
  
      res.json(folderStats);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener estadísticas por carpetas.',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      if (repoUrl) {
        try {
          await removeDirectory(finalRepoPath);
        } catch (cleanupError) {
          console.error('Error al limpiar el repositorio clonado:', cleanupError instanceof Error ? cleanupError.message : 'Error desconocido');
        }
      }
    }
  };
  