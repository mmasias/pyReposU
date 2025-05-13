import { Request, Response } from "express";
import { getCommits, getFileContent, getFileDiff, getFirstCommitForFile } from "../utils/gitRepoUtils";
import { Commit, CommitFile, Repository } from "../models";
import { getPlaybackHistory } from "../services/filePlayback.service";
import { ensureCommitFileContentAndDiff } from "../services/fileAnalysisService";
//  Obtener contenido de un archivo en un commit
export const getFileContentHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath || !commitHash) {
    res.status(400).json({ message: "Faltan parámetros: repoUrl, filePath, commitHash." });
    return;
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
    res.status(500).json({ message: "Error al obtener contenido del archivo." });
  }
};

//  Obtener diff entre dos commits para un archivo
export const getFileDiffHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHashOld, commitHashNew, filePath } = req.query;

  if (!repoUrl || !commitHashOld || !commitHashNew || !filePath) {
    res.status(400).json({ message: "Faltan parámetros requeridos." });
    return;
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
    res.status(500).json({ message: "Error al obtener el diff." });
  }
};

//  Obtener primer commit donde aparece un archivo
export const getFirstCommitForFileHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  try {
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
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
      res.status(404).json({ message: "No se encontró el primer commit del archivo." });
    }

    if (commitFile) {
      res.status(200).json({ commitHash: commitFile.commitId });
    } else {
      res.status(404).json({ message: "No se encontró el primer commit del archivo." });
    }
  } catch (error) {
    console.error(`[getFirstCommitForFileHandler] Error:`, error);
    res.status(500).json({ message: "Error interno." });
  }
};

//  Obtener último commit donde aparece un archivo
export const getLatestCommitForFileHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  try {
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
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

    if (!latestFile || !latestFile.commitId) {
      res.status(404).json({ message: "No se encontró ningún commit para este archivo." });
    }

    if (!latestFile) {
      res.status(404).json({ message: "No se encontró ningún commit para este archivo." });
      return;
    }

    res.status(200).json({
      hash: latestFile.Commit!.hash,
      message: latestFile.Commit!.message,
      date: latestFile.Commit!.date,
      author: latestFile.Commit!.authorId,
    });

  } catch (error) {
    console.error(`[getLatestCommitForFileHandler]`, error);
    res.status(500).json({ message: "Error interno." });
  }
};

//  NUEVO: Playback de archivo a lo largo del tiempo
export const getFilePlaybackHandler = async (req: Request, res: Response) => {
  const { repoUrl, branch, filePath } = req.query;

  if (!repoUrl || !branch || !filePath) {
    res.status(400).json({ message: "Faltan parámetros: repoUrl, branch, filePath" });
    return;
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
    res.status(500).json({ message: "Error al obtener historial del archivo." });
  }
};
