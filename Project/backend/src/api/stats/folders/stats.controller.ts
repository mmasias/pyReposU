import { Request, Response } from 'express';
import simpleGit from 'simple-git';
import { PATHS } from '../../constants/path.constants';
import { removeDirectory, normalizePath } from '../../utils/file.utils';

export const getFolderStats = async (req: Request, res: Response): Promise<void> => {
  const repoPath = req.query.repoPath as string | undefined;
  const repoUrl = req.query.repoUrl as string | undefined;

  if (!repoPath && !repoUrl) {
    res.status(400).json({
      message: 'Se requiere el parámetro repoPath (local) o repoUrl (remoto).',
    });
    return;
  }

  let finalRepoPath: string = repoPath || `${PATHS.TEMP_REPO}/cloned-repo`;

  try {
    const git = simpleGit();

    if (repoUrl) {
      console.log(`Clonando repositorio: ${repoUrl}`);
      await git.clone(repoUrl, finalRepoPath);
    }

    const repoGit = simpleGit(finalRepoPath);
    const log = await repoGit.log();

    const folderStats: Record<
      string,
      { totalChanges: number; files: Record<string, number> }
    > = {};

    for (const commit of log.all) {
      const diffTree = await repoGit.raw([
        'diff-tree',
        '--no-commit-id',
        '--name-only',
        '-r',
        commit.hash,
      ]);
      const files = diffTree.split('\n').filter((file) => file);

      files.forEach((file) => {
        const normalizedFile = normalizePath(file);
        const folder = normalizedFile.split('/')[0];

        if (!folderStats[folder]) {
          folderStats[folder] = { totalChanges: 0, files: {} };
        }

        folderStats[folder].totalChanges += 1;
        folderStats[folder].files[normalizedFile] =
          (folderStats[folder].files[normalizedFile] || 0) + 1;

        console.log(`Archivo: ${file} | Normalizado: ${normalizedFile}`);
      });
    }

    res.json(folderStats);
  } catch (error) {
    console.error('Error al obtener estadísticas de carpetas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas de carpetas.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    if (repoUrl) {
      try {
        await removeDirectory(finalRepoPath);
      } catch (cleanupError) {
        console.error(
          'Error al limpiar el repositorio clonado:',
          cleanupError instanceof Error ? cleanupError.message : 'Error desconocido'
        );
      }
    }
  }
};

export const getFoldersOrdered = async (req: Request, res: Response): Promise<void> => {
  const repoUrl = req.query.repoUrl as string | undefined;
  const branch = req.query.branch as string | undefined;
  const author = req.query.author as string | undefined;
  const dateRangeStart = req.query.dateRangeStart as string | undefined;
  const dateRangeEnd = req.query.dateRangeEnd as string | undefined;

  if (!repoUrl) {
    res.status(400).json({ message: 'Se requiere el parámetro repoUrl.' });
    return;
  }

  const tempRepoPath = `${PATHS.TEMP_REPO}/cloned-repo`;

  try {
    const git = simpleGit();
    console.log(`Clonando repositorio: ${repoUrl}`);
    await git.clone(repoUrl, tempRepoPath);

    const repoGit = simpleGit(tempRepoPath);

    if (branch) {
      console.log(`Cambiando a la rama: ${branch}`);
      await repoGit.checkout(branch);
    }

    const logOptions: Record<string, string> = {};
    if (author) logOptions['--author'] = author;
    if (dateRangeStart && dateRangeEnd) {
      logOptions['--since'] = dateRangeStart;
      logOptions['--until'] = dateRangeEnd;
    }

    const log = await repoGit.log(logOptions);

    const folderStats: Record<string, number> = {};

    for (const commit of log.all) {
      const diffTree = await repoGit.raw([
        'diff-tree',
        '--no-commit-id',
        '--name-only',
        '-r',
        commit.hash,
      ]);
      const files = diffTree.split('\n').filter((file) => file);

      files.forEach((file) => {
        const folder = normalizePath(file.split('/')[0]);
        folderStats[folder] = (folderStats[folder] || 0) + 1;
      });
    }

    const orderedFolders = Object.entries(folderStats)
      .sort((a, b) => b[1] - a[1])
      .map(([folder, changes]) => ({ folder, changes }));

    res.json(orderedFolders);
  } catch (error) {
    console.error('Error al obtener carpetas ordenadas:', error);
    res.status(500).json({
      message: 'Error al obtener carpetas ordenadas.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    try {
      await removeDirectory(tempRepoPath);
    } catch (cleanupError) {
      console.error('Error limpiando directorio:', cleanupError);
    }
  }
};
