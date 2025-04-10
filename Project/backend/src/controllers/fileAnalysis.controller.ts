import { Request, Response } from "express";
import { getCommits, getFileContent } from "../utils/gitRepoUtils";
import axios from "axios";

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
    res.status(400).json({ message: "Se requieren los parámetros repoUrl y filePath." });
    return;
  }

  try {
    const commits = await getCommits(repoUrl as string);
    const fileCommits = commits.filter(c => c.files.includes(filePath as string));

    if (fileCommits.length < 2) {
      res.status(400).json({ message: "No hay suficientes versiones del archivo para comparar." });
      return;
    }

    const first = fileCommits[0];
    const last = fileCommits[fileCommits.length - 1];
    const middle = fileCommits
      .slice(1, -1)
      .sort((a, b) => b.files.length - a.files.length)
      .slice(0, 3);

    const selectedCommits = [first, ...middle, last];

    const snapshots = await Promise.all(selectedCommits.map(async (commit) => {
      const content = await getFileContent(repoUrl as string, commit.hash, filePath as string);
      return { commit: commit.hash, content };
    }));

    const prompt = buildSimplifiedPrompt(snapshots);

    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "codellama:7b",
      prompt,
      stream: false,
    });

    const raw = response.data.response.trim();

    res.status(200).json({
      summary: raw,
      commits: selectedCommits.map((c) => c.hash),
    });
  } catch (error) {
    console.error(`[analyzeDeepHandler] Error:`, error);
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
