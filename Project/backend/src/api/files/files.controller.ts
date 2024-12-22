import { Request, Response } from 'express';
import simpleGit from 'simple-git';
import { normalizePath, removeDirectory } from '../utils/file.utils';
import { PATHS } from '../constants/path.constants';

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  console.log(`Repo URL: ${repoUrl}, Commit: ${commitHash}, File Path: ${filePath}`);
  
  if (!repoUrl || !commitHash || !filePath) {
    res.status(400).json({ message: 'Se requieren los parámetros repoUrl, commitHash y filePath.' });
    return;
  }

  const tempRepoPath = `${PATHS.TEMP_REPO}/cloned-repo`;

  try {
    const git = simpleGit();

    // Clonar el repositorio
    console.log('Clonando el repositorio...');
    await git.clone(repoUrl as string, tempRepoPath);
    console.log(`Repositorio clonado temporalmente en: ${tempRepoPath}`);

    // Cambiar al directorio clonado
    git.cwd(tempRepoPath);

    // Normalizar la ruta del archivo
    const normalizedPath = normalizePath(filePath as string);
    console.log(`Ruta del archivo normalizada: ${normalizedPath}`);

    // Verificar si el archivo existe en el commit
    console.log('Verificando si el archivo existe en el commit...');
    const fileCheck = await git.raw(['ls-tree', '-r', '--name-only', commitHash as string]);
    const filesInCommit = fileCheck.split('\n').map(normalizePath).filter(f => f);
    
    if (!filesInCommit.includes(normalizedPath)) {
      console.error(`Archivo no encontrado: ${normalizedPath}`);
      res.status(404).json({
        message: `El archivo ${filePath} no se encontró en el commit ${commitHash}.`,
      });
      return;
    }

    // Intentar obtener el contenido del archivo
    console.log(`Obteniendo el contenido del archivo: ${normalizedPath}`);
    let fileContent = await git.raw(['show', `${commitHash}:${normalizedPath}`]);

    // Verificar si el contenido es vacío
    if (!fileContent) {
      console.warn(`Contenido vacío para el archivo: ${normalizedPath}`);
      fileContent = `Aviso: El archivo ${normalizedPath} está vacío en el commit ${commitHash}.`;
    }

    console.log(`Contenido del archivo:\n${fileContent}`);
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error al obtener el contenido del archivo:', error);
    res.status(500).json({
      message: `No se pudo obtener el contenido del archivo ${filePath} en el commit ${commitHash}.`,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    try {
      await removeDirectory(tempRepoPath);
      console.log(`Directorio temporal eliminado: ${tempRepoPath}`);
    } catch (cleanupError) {
      console.error(`Error limpiando el repositorio clonado: ${cleanupError}`);
    }
  }
};
export const getFileDiff = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    res.status(400).json({ message: 'Se requieren los parámetros repoUrl, commitHashOld, commitHashNew y filePath.' });
    return;
  }

  const tempRepoPath = `${PATHS.TEMP_REPO}/cloned-repo`;

  try {
    const git = simpleGit();
    console.log('Clonando el repositorio...');
    await git.clone(repoUrl as string, tempRepoPath);
    git.cwd(tempRepoPath);

    console.log(`Obteniendo el diff para ${filePath}`);
    const diffOutput = await git.raw(['diff', `${commitHashOld}:${filePath}`, `${commitHashNew}:${filePath}`]);

    const added: string[] = [];
    const removed: string[] = [];
    const unchanged: string[] = [];

    // Procesar el diff línea por línea
    const lines = diffOutput.split('\n');
    lines.forEach(line => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        added.push(line.slice(1));
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removed.push(line.slice(1));
      } else if (!line.startsWith('+') && !line.startsWith('-') && !line.startsWith('@@') && line.trim()) {
        unchanged.push(line);
      }
    });

    res.json({ added, removed, unchanged });
  } catch (error) {
    console.error('Error al obtener el diff:', error);
    res.status(500).json({
      message: 'Error al obtener el diff del archivo.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    await removeDirectory(tempRepoPath).catch(err => console.error('Error limpiando directorio:', err));
  }
};