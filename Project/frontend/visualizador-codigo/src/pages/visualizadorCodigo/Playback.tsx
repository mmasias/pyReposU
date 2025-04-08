import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactJson from "react-json-view";
import CommitTimeline from "../../components/visualizadorCodigo/CommitTimeline";

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
  const [latestCommitData, setLatestCommitData] = useState<any>(null);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const repo = location.state?.repoUrl || repoUrl;

  const normalizedFilePath = useMemo(() => {
    let path = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return path.includes(".") ? path : `${path}/README.md`;
  }, [filePath]);

  const fetchCommits = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/commits?repoUrl=${encodeURIComponent(repo)}`
      );

      const allCommits = response.data;
      const filtered = allCommits.filter(
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
      const response = await axios.get(
        `http://localhost:3000/api/files/content?repoUrl=${encodeURIComponent(repo)}&filePath=${encodeURIComponent(
          normalizedFilePath
        )}&commitHash=${commitHash}`
      );
      setContent(response.data.split("\n"));
    } catch {
      setContent(["// Error al cargar contenido"]);
    }
  };

  const fetchDiff = async (commitHashOld: string, commitHashNew: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/files/diff?repoUrl=${encodeURIComponent(
          repo
        )}&filePath=${encodeURIComponent(
          normalizedFilePath
        )}&commitHashOld=${commitHashOld}&commitHashNew=${commitHashNew}`
      );

      setAddedLines(response.data.addedLines || []);
      setRemovedLines(response.data.removedLines || []);
    } catch {
      setAddedLines([]);
      setRemovedLines([]);
    }
  };

  const fetchFirstAndLatestCommits = async () => {
    try {
      const [firstRes, latestRes] = await Promise.all([
        axios.get("http://localhost:3000/api/files/first-commit", {
          params: { repoUrl: repo, filePath: normalizedFilePath },
        }),
        axios.get("http://localhost:3000/api/files/latest-commit", {
          params: { repoUrl: repo, filePath: normalizedFilePath },
        }),
      ]);

      setFirstCommitHash(firstRes.data.commitHash);
      setLatestCommitData(latestRes.data);
    } catch (err) {
      console.error("Error obteniendo primer o último commit:", err);
    }
  };

  useEffect(() => {
    fetchCommits();
    fetchFirstAndLatestCommits();
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

  const goToCommit = (commitHash: string) => {
    const index = commits.findIndex((c) => c.hash === commitHash);
    if (index !== -1) setCurrentIndex(index);
  };

  const handleExpressAnalysis = async () => {
    if (commits.length < 2) return;

    const oldCommit = commits[currentIndex + 1]?.hash;
    const newCommit = commits[currentIndex]?.hash;

    if (!oldCommit || !newCommit) return;

    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const response = await axios.get("http://localhost:3000/api/files/analyze-express", {
        params: {
          repoUrl: repo,
          filePath: normalizedFilePath,
          commitHashOld: oldCommit,
          commitHashNew: newCommit,
        },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("[Análisis rápido] Error:", err);
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
        params: {
          repoUrl: repo,
          filePath: normalizedFilePath,
        },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("[Análisis profundo] Error:", err);
      setAnalysisResult({ error: "Error al realizar análisis profundo." });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const renderWithDiffHighlight = (content: string[], linesToHighlight: string[], highlightColor: string) =>
    content.map((line, index) => (
      <pre
        key={index}
        style={{
          backgroundColor: linesToHighlight.includes(line) ? highlightColor : "transparent",
          color: "#333",
          padding: "4px 6px",
          borderRadius: "3px",
          fontSize: "14px",
          fontFamily: "monospace",
          margin: "0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {line || <span>&nbsp;</span>}
      </pre>
    ));

  const currentCommit = commits[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Playback de Cambios</h1>
        <p className="text-lg text-gray-600 mt-2">Visualiza los cambios commit por commit en el archivo</p>
        <button
          onClick={() => navigate("../visualizador", { state: { repoUrl: repo } })}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 mt-4"
        >
          Volver
        </button>
      </header>

      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="container mx-auto px-4">
        {/*  Info del commit actual */}
        {currentCommit && (
          <div className="mb-6 bg-white p-4 rounded shadow text-sm text-gray-700">
            <p><strong>Commit actual:</strong> <span className="font-mono">{currentCommit.hash}</span></p>
            <p><strong>Autor:</strong> {currentCommit.author}</p>
            <p><strong>Fecha:</strong> {new Date(currentCommit.date).toLocaleString()}</p>
            <p><strong>Mensaje:</strong> {currentCommit.message}</p>
          </div>
        )}

        {/* ⏮️⏭️ Botones ir al primer/último */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => goToCommit(commits[0]?.hash)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow hover:bg-yellow-600"
          >
            Último commit
          </button>
          <button
            onClick={() => firstCommitHash && goToCommit(firstCommitHash)}
            className="bg-pink-500 text-white px-4 py-2 rounded-md shadow hover:bg-pink-600"
          >
            Primer commit
          </button>
        </div>

        {/*  Diffs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Versión Anterior</h2>
            <div className="p-4 rounded-md bg-gray-100 border">
              {renderWithDiffHighlight(prevContent, removedLines, "rgba(255, 99, 71, 0.3)")}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Versión Actual</h2>
            <div className="p-4 rounded-md bg-gray-100 border">
              {renderWithDiffHighlight(currContent, addedLines, "rgba(144, 238, 144, 0.3)")}
            </div>
          </div>
        </div>

        {/*  Navegación básica */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex + 1 >= commits.length}
            className="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex <= 0}
            className="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        {/*  Análisis con IA */}
        <div className="mt-10 text-center">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Análisis con IA</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleExpressAnalysis}
              disabled={loadingAnalysis}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
            >
              Análisis rápido
            </button>
            <button
              onClick={handleDeepAnalysis}
              disabled={loadingAnalysis}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
            >
              Análisis profundo
            </button>
          </div>

          {loadingAnalysis && <p className="mt-4 text-blue-500">⏳ Analizando, esto puede tardar unos minutos...</p>}
          {analysisResult && (
            <div className="mt-6 bg-white p-4 rounded shadow border text-left max-w-4xl mx-auto">
              <ReactJson src={analysisResult} collapsed={false} enableClipboard={false} />
            </div>
          )}
        </div>

        {/*  Historial */}
        <h2 className="text-xl font-bold text-gray-700 mt-10 mb-4">Historial de Commits</h2>
        <CommitTimeline
          repoUrl={repo}
          filePath={normalizedFilePath}
          onCommitClick={(commitHash) => {
            const newIndex = commits.findIndex((c) => c.hash === commitHash);
            if (newIndex !== -1) {
              setCurrentIndex(newIndex);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Playback;
