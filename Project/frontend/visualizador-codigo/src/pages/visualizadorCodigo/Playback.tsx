import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CommitTimeline from "../../components/visualizadorCodigo/CommitTimeline";
import CommitInfo from "../../components/visualizadorCodigo/CommitInfo";
import CommitNavigation from "../../components/visualizadorCodigo/CommitNavigation";
import DiffViewer from "../../components/visualizadorCodigo/DiffViewer";
import AIAnalysisPanel from "../../components/visualizadorCodigo/AIAnalysisPanel";

const Playback = () => {
  const { repoUrl = "", filePath = "" } = useParams<{ repoUrl: string; filePath: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [commits, setCommits] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevContent, setPrevContent] = useState<string[]>([]);
  const [currContent, setCurrContent] = useState<string[]>([]);
  const [addedLines, setAddedLines] = useState<string[]>([]);
  const [removedLines, setRemovedLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [firstCommitHash, setFirstCommitHash] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const repo = location.state?.repoUrl || repoUrl;

  const normalizedFilePath = useMemo(() => {
    let path = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return path.includes(".") ? path : `${path}/README.md`;
  }, [filePath]);

  const fetchCommits = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/commits", {
        params: { repoUrl: repo },
      });

      const filtered = response.data.filter(
        (commit: any) =>
          Array.isArray(commit.files) &&
          commit.files.some((file: string) => file.startsWith(normalizedFilePath))
      );

      if (filtered.length === 0) {
        setError("No se encontraron commits para este archivo.");
        return;
      }

      setCommits(filtered);
    } catch (err) {
      console.error("[Playback] Error al cargar commits:", err);
      setError("Error al cargar los commits.");
    }
  };

  const fetchFileContent = async (commitHash: string, setContent: (content: string[]) => void) => {
    try {
      const response = await axios.get("http://localhost:3000/api/files/content", {
        params: { repoUrl, filePath: normalizedFilePath, commitHash },
      });
      setContent(response.data.split("\n"));
    } catch {
      setContent(["// Error al cargar contenido"]);
    }
  };

  const fetchDiff = async (oldHash: string, newHash: string) => {
    try {
      const response = await axios.get("http://localhost:3000/api/files/diff", {
        params: {
          repoUrl,
          filePath: normalizedFilePath,
          commitHashOld: oldHash,
          commitHashNew: newHash,
        },
      });
      setAddedLines(response.data.addedLines || []);
      setRemovedLines(response.data.removedLines || []);
    } catch {
      setAddedLines([]);
      setRemovedLines([]);
    }
  };

  const fetchCommitBounds = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/files/first-commit", {
        params: { repoUrl, filePath: normalizedFilePath },
      });
      setFirstCommitHash(res.data.commitHash);
    } catch (err) {
      console.error("Error obteniendo primer commit:", err);
    }
  };

  useEffect(() => {
    fetchCommits();
    fetchCommitBounds();
  }, [repo, filePath]);

  useEffect(() => {
    if (commits.length > 0) {
      const current = commits[currentIndex];
      const previous = commits[currentIndex + 1];

      fetchFileContent(current.hash, setCurrContent);

      if (previous) {
        fetchFileContent(previous.hash, setPrevContent);
        fetchDiff(previous.hash, current.hash);
      } else {
        setPrevContent([]);
        setAddedLines([]);
        setRemovedLines([]);
      }

      setAnalysisResult(null);
    }
  }, [commits, currentIndex]);

  const handlePrevious = () => {
    if (currentIndex + 1 < commits.length) setCurrentIndex(currentIndex + 1);
  };

  const handleNext = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToCommit = (hash: string) => {
    const idx = commits.findIndex((c) => c.hash === hash);
    if (idx !== -1) setCurrentIndex(idx);
  };

  const handleExpressAnalysis = async () => {
    if (commits.length < 2) return;

    const oldHash = commits[currentIndex + 1]?.hash;
    const newHash = commits[currentIndex]?.hash;

    if (!oldHash || !newHash) return;

    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const response = await axios.get("http://localhost:3000/api/files/analyze-express", {
        params: { repoUrl, filePath: normalizedFilePath, commitHashOld: oldHash, commitHashNew: newHash },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("Análisis rápido falló:", err);
      setAnalysisResult({ error: "Error al realizar análisis rápido." });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleDeepAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const response = await axios.get("http://localhost:3000/api/files/analyze-deep", {
        params: { repoUrl, filePath: normalizedFilePath },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("Análisis profundo falló:", err);
      setAnalysisResult({ error: "Error al realizar análisis profundo." });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const currentCommit = commits[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Playback de Cambios</h1>
        <p className="text-lg text-gray-600 mt-2">
          Visualiza los cambios commit por commit en el archivo
        </p>
        <button
          onClick={() => navigate("../visualizador", { state: { repoUrl: repo } })}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 mt-4"
        >
          Volver
        </button>
      </header>

      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="container mx-auto px-4">
        {currentCommit && <CommitInfo commit={currentCommit} />}

        <CommitNavigation
          currentIndex={currentIndex}
          totalCommits={commits.length}
          firstCommitHash={firstCommitHash || undefined}
          lastCommitHash={commits[0]?.hash}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onGoToFirst={() => firstCommitHash && goToCommit(firstCommitHash)}
          onGoToLast={() => goToCommit(commits[0]?.hash)}
        />

        <DiffViewer
          leftLines={prevContent}
          rightLines={currContent}
          addedLines={addedLines}
          removedLines={removedLines}
        />

        <AIAnalysisPanel
          loading={loadingAnalysis}
          result={analysisResult}
          onQuickAnalysis={handleExpressAnalysis}
          onDeepAnalysis={handleDeepAnalysis}
        />

        <h2 className="text-xl font-bold text-gray-700 mt-10 mb-4">Historial de Commits</h2>
        <CommitTimeline
          repoUrl={repo}
          filePath={normalizedFilePath}
          onCommitClick={(hash) => goToCommit(hash)}
        />
      </div>
    </div>
  );
};

export default Playback;
