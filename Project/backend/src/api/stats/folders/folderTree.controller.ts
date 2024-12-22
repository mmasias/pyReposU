import { Request, Response } from 'express';
import simpleGit from 'simple-git';
import path from 'path';
import { removeDirectory, normalizePath } from '../../utils/file.utils';
import { PATHS } from '../../constants/path.constants';

export const getRepositoryTree = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl } = req.query;

  if (!repoUrl) {
    res.status(400).json({ message: 'Se requiere el parámetro repoUrl.' });
    return;
  }

  const tempRepoPath = path.join(PATHS.TEMP_REPO, 'cloned-repo');

  try {
    const git = simpleGit();

    // Clonar el repositorio
    console.log('Clonando el repositorio...');
    await git.clone(repoUrl as string, tempRepoPath);

    const repoGit = simpleGit(tempRepoPath);

    // Obtener estadísticas de cambios con `git log --numstat`
    const gitLogOutput = await repoGit.raw(['log', '--numstat', '--pretty=format:']);

    const fileChangesMap: Record<string, number> = parseGitLog(gitLogOutput);

    // Obtener los archivos rastreados por Git
    const gitFiles = await repoGit.raw(['ls-tree', '-r', '--name-only', 'HEAD']); // Archivos rastreados
    const trackedFiles = gitFiles.split('\n').filter(Boolean);

    // Normalizar los archivos
    const normalizedFiles = trackedFiles.map(normalizePath);

    // Construir el árbol a partir de los archivos normalizados
    const tree = buildTreeFromTrackedFiles(normalizedFiles, fileChangesMap);

    res.status(200).json(tree);
  } catch (error) {
    console.error('Error al obtener el árbol del repositorio:', error);
    res.status(500).json({
      message: 'Error al obtener el árbol del repositorio.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    // Eliminar el directorio temporal
    await removeDirectory(tempRepoPath);
  }
};

// Procesar la salida de `git log --numstat`
const parseGitLog = (gitLogOutput: string): Record<string, number> => {
  const fileChangesMap: Record<string, number> = {};
  const lines = gitLogOutput.split('\n');

  lines.forEach((line) => {
    const parts = line.trim().split('\t');
    if (parts.length === 3) {
      const [additions, deletions, filePath] = parts;
      const totalChanges = parseInt(additions, 10) + parseInt(deletions, 10);
      if (!isNaN(totalChanges)) {
        fileChangesMap[filePath] = (fileChangesMap[filePath] || 0) + totalChanges;
      }
    }
  });

  return fileChangesMap;
};

// Construir el árbol a partir de archivos rastreados por Git y estadísticas de cambios
const buildTreeFromTrackedFiles = (
  trackedFiles: string[],
  fileChangesMap: Record<string, number>
) => {
  const tree: any = { subfolders: [], files: [] };

  trackedFiles.forEach((filePath) => {
    const parts = filePath.split('/');
    let currentLevel = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // Es un archivo
        currentLevel.files.push({
          name: part,
          changes: fileChangesMap[filePath] || 0, // Asignar cambios al archivo
        });
      } else {
        // Es una carpeta
        let folder = currentLevel.subfolders.find((sub: any) => sub.name === part);
        if (!folder) {
          folder = { name: part, subfolders: [], files: [], changes: 0 };
          currentLevel.subfolders.push(folder);
        }
        folder.changes += fileChangesMap[filePath] || 0; // Sumar cambios en la carpeta
        currentLevel = folder;
      }
    });
  });

  return tree;
};
