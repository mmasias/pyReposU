import { Request, Response } from 'express';
import simpleGit from 'simple-git';
import { PATHS } from '../constants/path.constants';
import { removeDirectory, normalizePath } from '../utils/file.utils';

export const getCommits = async (req: Request, res: Response): Promise<void> => {
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

    const commits = await Promise.all(
      log.all.map(async commit => {
        const filesOutput = await git.raw([
          'show',
          '--pretty=format:',
          '--name-only',
          commit.hash,
        ]);

        // Decodificar y normalizar las rutas de los archivos
        const files = filesOutput
          .split('\n')
          .filter(file => file)
          .map(file => {
            const normalized = normalizePath(file);
            console.log(`Archivo original: ${file} | Normalizado: ${normalized}`);
            return normalized;
          });

        // Retornar el commit completo con los archivos
        return {
          hash: commit.hash,
          message: commit.message,
          date: commit.date,
          author: commit.author_name,
          files, // Incluir los archivos normalizados
        };
      })
    );

    res.json(commits);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener commits.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    if (repoUrl) {
      try {
        await removeDirectory(finalRepoPath);
      } catch (cleanupError) {
        if (cleanupError instanceof Error) {
          console.error('Error al limpiar el repositorio clonado:', cleanupError.message);
        } else {
          console.error('Error al limpiar el repositorio clonado:', cleanupError);
        }
      }
    }
  }
};
