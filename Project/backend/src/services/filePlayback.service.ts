import { Op } from 'sequelize';
import { Commit, CommitFile, Repository, User } from '../models';
import { safeGetFileContent } from '../utils/gitRepoUtils';
import { generateFileDiff } from '../utils/diffUtils';
import { AppError } from '../middleware/errorHandler';

export const getPlaybackHistory = async (
  repoUrl: string,
  branch: string,
  filePath: string
) => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);

  const commitFiles = await CommitFile.findAll({
    include: [
      {
        model: Commit,
        where: { repositoryId: repo.id },
        include: [
          {
            association: Commit.associations.CommitBranches,
            required: true,
            include: [
              {
                association: 'branch',
                where: { name: branch },
                required: true,
              },
            ],
          },
        ],
      },
    ],
    where: {
      filePath: { [Op.iLike]: `%${filePath}` },
    },
    order: [[Commit, 'date', 'ASC']],
  });

  if (commitFiles.length === 0) {
    throw new AppError("FILE_NOT_FOUND", `No se encontró historial del archivo ${filePath}`, 404);
  }

  const results = [];
  let prevContent: string | null = null;

  for (let i = 0; i < commitFiles.length; i++) {
    const commitFile = commitFiles[i];
    const commit = commitFile.Commit!;
    const commitHash = commit.hash;

    try {
      const content = await safeGetFileContent(repoUrl, commitHash, commitFile.filePath);
      if (content === null) {
        console.warn(`[⚠️ OMITIDO] Archivo no existe en commit o aun no esta sincronizado ${commit.hash}`);
        continue;
      }

      // 🔎 Consultar el nombre del autor directamente si tienes su ID
      let authorName = '';
      if (commit.authorId) {
        const user = await User.findByPk(commit.authorId);
        authorName = user?.name || String(commit.authorId); // fallback al ID si no existe
      }

      const diff = prevContent !== null ? generateFileDiff(prevContent, content) : "";

      results.push({
        commitHash: commit.hash,
        content,
        date: commit.date.toISOString(),
        diffWithPrev: diff, // 💥 siempre string, aunque esté vacío
        author: authorName,
        message: commit.message || '',
      });


      prevContent = content;
    } catch (err: any) {
      console.warn(`[⚠️ OMITIDO] Archivo no existe en commit o aun no esta sincronizado ${commit.hash}`);
    }
  }

  return results;
};
