import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useParams, useNavigate } from "react-router-dom";

const Playback = () => {
  const { repoUrl = "", filePath = "" } = useParams<{ repoUrl: string; filePath: string }>();
  const navigate = useNavigate();

  const [commits, setCommits] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevContent, setPrevContent] = useState("// Cargando...");
  const [currContent, setCurrContent] = useState("// Cargando...");
  const [error, setError] = useState<string | null>(null);

  const normalizedFilePath = useMemo(() => {
    let path = filePath.startsWith("/") ? filePath.slice(1) : filePath; // Remover barra inicial
    if (!path.includes(".")) {
      console.warn(`[Playback] El filePath "${path}" parece ser una carpeta. Cambiando a README.md por defecto.`);
      path = `${path}/README.md`;
    }
    console.log(`[Playback] FilePath normalizado: ${path}`);
    return path;
  }, [filePath]);

  const fetchCommits = async () => {
    console.log("[Playback] Iniciando fetchCommits...");
    console.log(`[Playback] repoUrl recibido: ${repoUrl}`);
    console.log(`[Playback] filePath recibido: ${filePath}`);
    console.log(`[Playback] filePath normalizado: ${normalizedFilePath}`);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/commits?repoUrl=${encodeURIComponent(repoUrl)}`
      );
      const allCommits = response.data;
      console.log("[Playback] Commits recibidos del backend:", allCommits);

      const filteredCommits = allCommits.filter(
        (commit: any) =>
          Array.isArray(commit.files) &&
          commit.files.some((file: string) => file.startsWith(normalizedFilePath))
      );

      console.log("[Playback] Commits filtrados para este archivo:", filteredCommits);

      if (filteredCommits.length === 0) {
        setError("No se encontraron commits para este archivo.");
        return;
      }

      setCommits(filteredCommits);
      setError(null);
    } catch (err) {
      setError("Error al cargar los commits.");
      console.error("[Playback] Error al cargar los commits:", err);
    }
  };

  const fetchFileContent = async (commitHash: string, setContent: (content: string) => void) => {
    console.log(`[Playback] Solicitando contenido del archivo en el commit ${commitHash}`);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/files/content?repoUrl=${encodeURIComponent(
          repoUrl
        )}&filePath=${encodeURIComponent(normalizedFilePath)}&commitHash=${commitHash}`
      );
      console.log(`[Playback] Contenido recibido para commit ${commitHash}:`, response.data);
      setContent(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn(
          `[Playback] Archivo no encontrado en commit ${commitHash}: ${normalizedFilePath}`
        );
        setContent(`// El archivo ${normalizedFilePath} no se encuentra en el commit ${commitHash}.`);
      } else {
        console.error(`[Playback] Error al cargar contenido del commit ${commitHash}:`, err);
        setContent("// Error al cargar contenido");
      }
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [repoUrl, filePath]);

  useEffect(() => {
    if (commits.length > 0) {
      console.log("[Playback] Commits disponibles para renderizado:", commits);

      const currentCommit = commits[currentIndex];
      const previousCommit = commits[currentIndex + 1];

      console.log("[Playback] Commit actual:", currentCommit);
      console.log("[Playback] Commit previo:", previousCommit);

      if (currentCommit) {
        fetchFileContent(currentCommit.hash, setCurrContent);
      }
      if (previousCommit) {
        fetchFileContent(previousCommit.hash, setPrevContent);
      } else {
        setPrevContent("// Archivo creado en este commit.");
      }
    }
  }, [commits, currentIndex]);

  const handlePrevious = () => {
    if (currentIndex + 1 < commits.length) {
      console.log("[Playback] Navegando al commit anterior.");
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      console.log("[Playback] Navegando al siguiente commit.");
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Playback de Cambios</h1>
        <p className="text-lg text-gray-600 mt-2">Visualiza los cambios commit por commit en el archivo</p>
        <button
          onClick={() => navigate(-1)}
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
            <div className="bg-gray-900 text-white p-4 rounded-md">
              <SyntaxHighlighter language="javascript" style={dracula}>
                {prevContent}
              </SyntaxHighlighter>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Versión Actual</h2>
            <div className="bg-gray-900 text-white p-4 rounded-md">
              <SyntaxHighlighter language="javascript" style={dracula}>
                {currContent}
              </SyntaxHighlighter>
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
