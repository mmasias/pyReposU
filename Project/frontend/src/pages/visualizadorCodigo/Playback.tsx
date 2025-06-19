import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CommitTimeline from "../../components/visualizadorCodigo/CommitTimeline";
import CommitInfo from "../../components/visualizadorCodigo/CommitInfo";
import CommitNavigation from "../../components/visualizadorCodigo/CommitNavigation";
import DiffViewer from "../../components/visualizadorCodigo/DiffViewer";
import AIAnalysisPanel from "../../components/visualizadorCodigo/AIAnalysisPanel";
import { ERROR_MESSAGES, CONSOLE_LOG_MESSAGES } from "../../utils/constants/errorConstants";
import { getTreeFromCache } from "../../utils/cacheUtils";

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


  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const repo = location.state?.repoUrl || repoUrl;

  const normalizedFilePath = useMemo(() => {
    let path = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return path.includes(".") ? path : `${path}/README.md`;
  }, [filePath]);

  const fetchPlaybackData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/playback`, {
        params: {
          repoUrl: repo,
          filePath: normalizedFilePath,
          branch: "main", // ⚠️ puedes cambiar esto por una rama seleccionada si lo necesitas dinámico
        },
      });

      const commitsFromServer = response.data || [];
      if (!commitsFromServer.length) {
        setError(ERROR_MESSAGES.NO_COMMITS_FOUND);
        return;
      }

    const reversed = [...commitsFromServer].reverse(); 
    setCommits(commitsFromServer);    setCurrentIndex(0);
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.PLAYBACK_ERROR_LOADING_COMMITS, err);
      setError(ERROR_MESSAGES.ERROR_LOADING_COMMITS);
    }
  };


  const fetchFileContent = async (commitHash: string, setContent: (content: string[]) => void) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/content`, {
        params: { repoUrl, filePath: normalizedFilePath, commitHash },
      });
      const content = response.data || "";
      const lines = content.split("\n");
      const isAllEmpty = lines.every((line: string) => line.trim() === "");
  
      if (isAllEmpty) {
        setContent(["// Archivo vacío"]);
      } else {
        setContent(lines);
      }
    } catch (error) {
      console.error(CONSOLE_LOG_MESSAGES.FETCH_FILE_CONTENT_ERROR, error);
      setContent([ERROR_MESSAGES.ERROR_LOADING_CONTENT]);
    }
  };
  
  const fetchDiff = async (oldHash: string, newHash: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/diff`, {
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
  
  useEffect(() => {
    const savedTree = getTreeFromCache(repo, "main"); // o usa la branch dinámica si se soporta
    if (savedTree) {
      console.log(" Árbol cargado desde cache para Playback:", savedTree);
      // podrías mostrarlo, pasarlo a otro comp, o simplemente saber que existe
    }
  }, [repo]);

  useEffect(() => {
    fetchPlaybackData();
  }, [repo, filePath]);

  useEffect(() => {
    if (!commits.length) return;

    const previous = currentIndex > 0 ? commits[currentIndex - 1] : null;
    const current = commits[currentIndex];

    setCurrContent(current.content?.split("\n") || []);

    const diffLines = (current.diffWithPrev || "").split("\n");

    if (previous) {
      setPrevContent(previous.content?.split("\n") || []);
      setAddedLines(diffLines.filter((l: string) => l.startsWith("+ ")).map((l: string) => l.slice(2)));
      setRemovedLines(diffLines.filter((l: string) => l.startsWith("- ")).map((l: string) => l.slice(2)));
    } else {
      setPrevContent([]);
      setAddedLines([]);
      setRemovedLines([]);
    }

    setAnalysisResult(null);
  }, [commits, currentIndex]);



  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < commits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToCommit = (hash: string) => {
    const idx = commits.findIndex((c) => c.hash === hash);
    if (idx !== -1) setCurrentIndex(idx);
  };

  const handleExpressAnalysis = async () => {
    if (commits.length < 2 || currentIndex === 0) {
      alert("Este es el primer commit. No hay cambios anteriores para analizar.");
      return;
    }

    const newHash = commits[currentIndex].commitHash || commits[currentIndex].hash;
    const oldHash = commits[currentIndex - 1]?.commitHash || commits[currentIndex - 1]?.hash;
    if (!oldHash || !newHash) {
      alert("No se pudo encontrar un commit anterior válido para comparar.");
      return;
    }



    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/analyze-express`, {
        params: {
          repoUrl,
          filePath: normalizedFilePath,
          commitHashOld: oldHash,
          commitHashNew: newHash,
        },
      });

      setAnalysisResult(response.data);
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.QUICK_ANALYSIS_FAILED, err);
      setAnalysisResult({ error: ERROR_MESSAGES.ERROR_PERFORMING_QUICK_ANALYSIS });
    } finally {
      setLoadingAnalysis(false);
    }
  };




  const handleDeepAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/analyze-deep`, {
        params: { repoUrl, filePath: normalizedFilePath },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.DEEP_ANALYSIS_FAILED, err);
      setAnalysisResult({ error: ERROR_MESSAGES.ERROR_PERFORMING_DEEP_ANALYSIS });
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
        {currentCommit && <CommitInfo commit={commits[currentIndex]} />}

<CommitNavigation
  currentIndex={currentIndex}
  totalCommits={commits.length}
  lastCommitHash={commits[commits.length - 1]?.hash} // ✅ el más nuevo
  onPrevious={handlePrevious}
  onNext={handleNext}
  onGoToFirst={() => setCurrentIndex(0)} // ✅ primer commit
  onGoToLast={() => setCurrentIndex(commits.length - 1)} // ✅ último commit
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

        <CommitTimeline
          repoUrl={repo}
          filePath={normalizedFilePath}
          onCommitClick={(hash) => {
            const idx = commits.findIndex(c => c.commitHash === hash || c.hash === hash);
            if (idx !== -1) {
              setCurrentIndex(idx);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Playback;
