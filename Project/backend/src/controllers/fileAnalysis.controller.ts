import { Request, Response } from "express";
import { getCommits, getFileContent } from "../utils/gitRepoUtils";
import axios from "axios";
import { FileAnalysis, Commit, CommitFile, Repository } from '../models';

//  Prompt simplificado, sin estructura JSON
const buildSimplifiedPrompt = (
  snapshots: { commit: string; content: string }[]
): string => {
  const versionedContent = snapshots
    .map((s, i) => `==== Versión ${i + 1} (commit: ${s.commit}) ====\n${s.content}`)
    .join("\n\n");

  return `Analiza los siguientes cambios en un archivo de código. Resume qué se ha hecho entre versiones: funciones agregadas, eliminadas o modificadas, cambios estructurales o mejoras. Usa un lenguaje técnico pero claro.

${versionedContent}

Resumen del análisis:`;
};

// --- ANALISIS PROFUNDO ---
export const analyzeDeepHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath } = req.query;

  if (!repoUrl || !filePath) {
    res.status(400).json({ message: "Se requieren repoUrl y filePath." });
    return;
  }

  try {
    const repo = await Repository.findOne({ where: { url: repoUrl } });
    if (!repo) {
      res.status(404).json({ message: "Repositorio no encontrado." });
      return;
    }

    // Check si ya lo tenemos analizado
    const existing = await FileAnalysis.findOne({
      where: { repoId: repo.id, filePath, type: 'deep' }
    });

    if (existing) {
      res.status(200).json({
        summary: existing.summary,
        commits: existing.commitHashes,
        cached: true,
      });
    }

    // Obtener commits relacionados
    const commitFiles = await CommitFile.findAll({
      where: { filePath },
      include: [{
        model: Commit,
        where: { repositoryId: repo.id },
      }]
    });

    const commits = commitFiles.map(cf => cf.Commit!).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (commits.length < 2) {
      res.status(400).json({ message: "No hay suficientes versiones para comparar." });
      return;
    }

    const first = commits[0];
    const last = commits[commits.length - 1];
    const middle = commits.slice(1, -1).slice(0, 3);

    const selectedCommits = [first, ...middle, last];

    const snapshots = await Promise.all(selectedCommits.map(async commit => {
      const content = await getFileContent(repoUrl as string, commit.hash, filePath as string);
      return { commit: commit.hash, content };
    }));

    const prompt = buildSimplifiedPrompt(snapshots);

    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "codellama:7b",
      prompt,
      stream: false,
    });

    const summary = response.data.response.trim();
    const commitHashes = selectedCommits.map(c => c.hash);

    // Guardar análisis en la base de datos
    await FileAnalysis.create({
      repoId: repo.id,
      filePath,
      type: 'deep',
      summary,
      commitHashes,
    });

    res.status(200).json({ summary, commits: commitHashes });
  } catch (error) {
    console.error(`[analyzeDeepHandler]`, error);
    res.status(500).json({ message: "Error al realizar análisis profundo." });
  }
};

// --- ANALISIS EXPRESS ---
export const analyzeExpressHandler = async (req: Request, res: Response): Promise<void> => {
  const { repoUrl, filePath, commitHashOld, commitHashNew } = req.query;

  if (!repoUrl || !filePath || !commitHashOld || !commitHashNew) {
    res.status(400).json({
      message: "Faltan parámetros requeridos: repoUrl, filePath, commitHashOld y commitHashNew.",
    });
    return;
  }

  try {
    const contentOld = await getFileContent(
      repoUrl as string,
      commitHashOld as string,
      filePath as string
    );
    const contentNew = await getFileContent(
      repoUrl as string,
      commitHashNew as string,
      filePath as string
    );

    const prompt = buildSimplifiedPrompt([
      { commit: commitHashOld as string, content: contentOld },
      { commit: commitHashNew as string, content: contentNew },
    ]);

    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "codellama:7b",
      prompt,
      stream: false,
    });

    const raw = response.data.response.trim();

    res.status(200).json({
      summary: raw,
      commits: [commitHashOld, commitHashNew],
    });
  } catch (error) {
    console.error(`[analyzeExpressHandler] Error:`, error);
    res.status(500).json({ message: "Error al realizar análisis express." });
  }
};
