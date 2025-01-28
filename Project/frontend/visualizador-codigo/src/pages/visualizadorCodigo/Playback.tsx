import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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

  // Recuperar repoUrl desde el estado de navegación si no está en los params
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

      const filteredCommits = allCommits.filter(
        (commit: any) =>
          Array.isArray(commit.files) &&
          commit.files.some((file: string) => file.startsWith(normalizedFilePath))
      );

      if (filteredCommits.length === 0) {
        setError("No se encontraron commits para este archivo.");
        return;
      }

      setCommits(filteredCommits);
    } catch (err) {
      console.error("[Playback] Error al cargar los commits:", err);
      setError("Error al cargar los commits.");
    }
  };

  const fetchFileContent = async (commitHash: string, setContent: (content: string[]) => void) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/files/content?repoUrl=${encodeURIComponent(
          repo
        )}&filePath=${encodeURIComponent(normalizedFilePath)}&commitHash=${commitHash}`
      );
      setContent(response.data.split("\n"));
    } catch (err) {
      setContent(["// Error al cargar contenido"]);
    }
  };

  const fetchDiff = async (commitHashOld: string, commitHashNew: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/files/diff?repoUrl=${encodeURIComponent(
          repo
        )}&filePath=${encodeURIComponent(normalizedFilePath)}&commitHashOld=${commitHashOld}&commitHashNew=${commitHashNew}`
      );
      setAddedLines(response.data.addedLines);
      setRemovedLines(response.data.removedLines);
    } catch (err) {
      console.error("[Playback] Error al cargar el diff:", err);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [repo, filePath]);

  useEffect(() => {
    if (commits.length > 0) {
      const currentCommit = commits[currentIndex];
      const previousCommit = commits[currentIndex + 1];

      fetchFileContent(currentCommit.hash, setCurrContent);

      if (previousCommit) {
        fetchFileContent(previousCommit.hash, setPrevContent);
        fetchDiff(previousCommit.hash, currentCommit.hash);
      } else {
        setPrevContent([]);
        setAddedLines([]);
        setRemovedLines([]);
      }
    }
  }, [commits, currentIndex]);

  const handlePrevious = () => {
    if (currentIndex + 1 < commits.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Versión Anterior</h2>
            <div
              className="p-4 rounded-md"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                overflowX: "auto",
              }}
            >
              {renderWithDiffHighlight(prevContent, removedLines, "rgba(255, 99, 71, 0.3)")}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Versión Actual</h2>
            <div
              className="p-4 rounded-md"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                overflowX: "auto",
              }}
            >
              {renderWithDiffHighlight(currContent, addedLines, "rgba(144, 238, 144, 0.3)")}
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Playback;
