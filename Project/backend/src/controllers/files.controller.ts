import { Request, Response } from "express";
import { getCommits, getFileContent, getFileDiff, getFirstCommitForFile } from "../utils/gitRepoUtils";
import { Commit, CommitFile, Repository } from "../models";
import { getPlaybackHistory } from "../services/filePlayback.service";

//  Obtener contenido de un archivo en un commit
export const getFileContentHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, commitHash, filePath } = req.query;

  if (!repoUrl || !filePath || !commitHash) {
    res.status(400).json({ message: "Se requieren los parámetros repoUrl, filePath y commitHash." });
    return;
  }

  try {
    const hash = commitHash as string;
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
    }

    const commit = await Commit.findOne({
      where: {
        hash,
        repositoryId: repo.id,
      },
    });

    if (!commit) {
      res.status(404).json({ message: "Commit no encontrado." });
      return;
    }

    const content = await getFileContent(repoUrl as string, hash, filePath as string);

    const [commitFile, created] = await CommitFile.findOrCreate({
      where: {
        commitId: commit.id,
        filePath: filePath as string,
      },
      defaults: {
        linesAdded: 0,
        linesDeleted: 0,
        diff: "",
        content,
      },
    });

    if (!created && !commitFile.content) {
      commitFile.content = content;
      await commitFile.save();
    }

    res.status(200).send(content || "// Archivo vacío");
  } catch (error) {
    console.error(`[getFileContentHandler] Error:`, error);
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
    const repo = await Repository.findOne({ where: { url: repoUrl as string } });
    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
    }

    const newerCommit = await Commit.findOne({ where: { hash: commitHashNew } });
    if (!newerCommit) {
      res.status(404).json({ message: "Commit no encontrado." });
      return;
    }

    const commitFile = await CommitFile.findOne({
      where: {
        commitId: newerCommit.id,
        filePath: filePath as string,
      },
    });

    if (commitFile?.diff && commitFile.diff.length > 0) {
      const addedLines: string[] = [];
      const removedLines: string[] = [];

      commitFile.diff.split("\n").forEach((line) => {
        if (line.startsWith("+ ")) addedLines.push(line.slice(2));
        else if (line.startsWith("- ")) removedLines.push(line.slice(2));
      });

      res.status(200).json({ addedLines, removedLines });
      return;
    }

    // fallback
    const diff = await getFileDiff(repoUrl as string, commitHashOld as string, commitHashNew as string, filePath as string);
    res.status(200).json(diff);
  } catch (error) {
    console.error(`[getFileDiff] Error:`, error);
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
