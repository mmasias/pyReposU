import { Request, Response, NextFunction } from "express";
import { getCommits, getFileContent, getFileDiff, getFirstCommitForFile } from "../utils/gitRepoUtils";
import { Commit, CommitFile, Repository } from "../models";
import { getPlaybackHistory } from "../services/filePlayback.service";
import { ensureCommitFileContentAndDiff } from "../services/fileAnalysisService";
import { AppError } from "../middleware/errorHandler";

// Obtener contenido de un archivo en un commit
export const getFileContentHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath || !commitHash) {
    return next(new AppError("FILE_CONTENT_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const commitFile = await ensureCommitFileContentAndDiff(
      repoUrl as string,
      commitHash as string,
      filePath as string
    );
    res.status(200).send(commitFile.content || "// Archivo vacío");
  } catch (error) {
    console.error(`[getFileContentHandler]`, error);
    next(new AppError("FAILED_TO_GET_FILE_CONTENT"));
  }
};

// Obtener diff entre dos commits para un archivo
export const getFileDiffHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    return next(new AppError("FILE_DIFF_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const commitFile = await ensureCommitFileContentAndDiff(
      repoUrl as string,
      commitHashNew as string,
      filePath as string,
      commitHashOld as string
    );

    const diff = commitFile.diff || '';
    const addedLines: string[] = [];
    const removedLines: string[] = [];

    diff.split("\n").forEach((line) => {
      if (line.startsWith("+ ")) addedLines.push(line.slice(2));
      else if (line.startsWith("- ")) removedLines.push(line.slice(2));
    });

    res.status(200).json({ addedLines, removedLines });
  } catch (error) {
    console.error(`[getFileDiffHandler]`, error);
    next(new AppError("FAILED_TO_GET_FILE_DIFF"));
  }
};

// Obtener primer commit donde aparece un archivo
export const getFirstCommitForFileHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    return next(new AppError("REPO_URL_AND_FILE_PATH_REQUIRED", undefined, 400));
  }

  try {
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      throw new AppError("REPO_NOT_FOUND", undefined, 404);
    }

    const commitFile = await CommitFile.findOne({
      where: { filePath: filePath as string },
      include: [{
        model: Commit,
        as: 'Commit',
        where: { repositoryId: repo.id },
        required: true,
      }],
      order: [[Commit, 'date', 'ASC']]
    });

    if (!commitFile) {
      throw new AppError("FIRST_COMMIT_NOT_FOUND", undefined, 404);
    }

    res.status(200).json({ commitHash: commitFile.commitId });
  } catch (error) {
    console.error(`[getFirstCommitForFileHandler] Error:`, error);
    next(new AppError("FAILED_TO_GET_FILE_CONTENT"));
  }
};

// Obtener último commit donde aparece un archivo
export const getLatestCommitForFileHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    return next(new AppError("REPO_URL_AND_FILE_PATH_REQUIRED", undefined, 400));
  }

  try {
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      throw new AppError("REPO_NOT_FOUND", undefined, 404);
    }

    const latestFile = await CommitFile.findOne({
      where: { filePath: filePath as string },
      include: [{
        model: Commit,
        where: { repositoryId: repo.id },
        required: true,
      }],
      order: [[Commit, 'date', 'DESC']]
    });

    if (!latestFile || !latestFile.commitId || !latestFile.Commit) {
      throw new AppError("LATEST_COMMIT_NOT_FOUND", undefined, 404);
    }

    res.status(200).json({
      hash: latestFile.Commit.hash,
      message: latestFile.Commit.message,
      date: latestFile.Commit.date,
      author: latestFile.Commit.authorId,
    });
  } catch (error) {
    console.error(`[getLatestCommitForFileHandler]`, error);
    next(new AppError("INTERNAL_ERROR"));
  }
};

// Playback de archivo a lo largo del tiempo
export const getFilePlaybackHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { repoUrl, branch, filePath } = req.query;

  if (!repoUrl || !branch || !filePath) {
    return next(new AppError("FILE_PLAYBACK_PARAMS_REQUIRED", undefined, 400));
  }

  try {
    const data = await getPlaybackHistory(
      repoUrl as string,
      branch as string,
      filePath as string
    );

    res.status(200).json(data);
  } catch (err) {
    console.error("[getFilePlaybackHandler]", err);
    next(new AppError("FAILED_TO_GET_FILE_HISTORY"));
  }
};
