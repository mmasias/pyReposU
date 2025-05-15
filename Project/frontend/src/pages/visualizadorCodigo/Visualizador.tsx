import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ERROR_MESSAGES, CONSOLE_LOG_MESSAGES } from "../../utils/constants/errorConstants";
import FiltrosContribucionesYHeatMap from "../../components/BarraConFiltros";

const buildCacheKey = (repo: string, branch: string, since: string, until: string) => {
  return `treeCache::${repo}::${branch || "HEAD"}::${since || "no-start"}::${until || "no-end"}`;
};

const Visualizador = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");

  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedRepoUrl = location.state?.repoUrl || sessionStorage.getItem("repoUrl") || "";
    const savedBranch = sessionStorage.getItem("branch") || "";

    if (savedRepoUrl) {
      setRepoUrl(savedRepoUrl);
      setBranch(savedBranch);
      fetchTreeData(savedRepoUrl, savedBranch);
    }
  }, [location.state]);

  const fetchTreeData = async (url?: string, branchOverride?: string) => {
    setLoading(true);
    setError(null);
    setTreeData([]);
    setSelectedFile(null);

    try {
      const repo = typeof url === "string" ? url : repoUrl;
      if (!repo.startsWith("http")) {
        setError("URL del repositorio no válida.");
        setLoading(false);
        return;
      }

      let selectedBranch = branchOverride || branch;
      const cacheKey = buildCacheKey(repo, selectedBranch, since, until);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`[📦 CACHED] Usando árbol desde cache local: ${cacheKey}`);
        setTreeData([...parsed.subfolders, { files: parsed.files || [] }]);
        setLoading(false);
        return;
      }

      const params: Record<string, string> = { repoUrl: repo };
      if (selectedBranch) params.branch = selectedBranch;
      if (since) params.since = since;
      if (until) params.until = until;

      console.log("[📤 FRONT] Aplicando filtros:", { repo, branch: selectedBranch, since, until });

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/tree`, { params });

      if (res.data.warning) alert(res.data.warning);

      const rootTree = res.data.tree;
      const rootFiles = rootTree.files || [];
      const subfolders = rootTree.subfolders || [];

      // ✅ Guardar en cache
      localStorage.setItem(cacheKey, JSON.stringify({ files: rootFiles, subfolders }));

      setTreeData([...subfolders, { files: rootFiles }]);

      if (!selectedBranch) {
        const headRes = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/current-branch`, {
          params: { repoUrl: repo },
        });
        selectedBranch = headRes.data.currentBranch;
        setBranch(selectedBranch);
      }

      sessionStorage.setItem("repoUrl", repo);
      sessionStorage.setItem("branch", selectedBranch);
      sessionStorage.setItem("treeData", JSON.stringify(subfolders));
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.ERROR_LOADING_TREE, err);
      setError(ERROR_MESSAGES.ERROR_LOADING_REPO_TREE);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath: string, commitHash: string) => {
    try {
      const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo/content`, {
        params: { repoUrl, filePath: cleanPath, commitHash },
      });
      setSelectedFile({ path: cleanPath, content: res.data });
    } catch {
      setError(ERROR_MESSAGES.ERROR_LOADING_FILE_CONTENT);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const clearRepository = () => {
    setRepoUrl("");
    setBranch("");
    setTreeData([]);
    setSelectedFile(null);
    sessionStorage.removeItem("repoUrl");
    sessionStorage.removeItem("treeData");
    sessionStorage.removeItem("branch");

    // 🔥 Limpieza del cache local
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("treeCache::")) {
        localStorage.removeItem(key);
      }
    });
  };

  const renderTree = (nodes: any[], currentPath = "") =>
    nodes.map((node, idx) => {
      const fullPath = node.name ? `${currentPath}/${node.name}` : currentPath;

      return (
        <div key={idx} className="ml-4 mt-2">
          {node.name && node.subfolders && (
            <div
              className="cursor-pointer flex items-center bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="font-semibold text-gray-800">{node.name}</span>
              <span className="ml-auto text-gray-500">{node.changes || 0} cambios</span>
            </div>
          )}

          {expandedFolders.includes(fullPath) && node.subfolders && renderTree(node.subfolders, fullPath)}

          {node.files && (!node.name || expandedFolders.includes(fullPath)) && (
            <div className="ml-6 mt-2">
              {node.files.map((file: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center bg-white hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
                >
                  <span className="mr-2"></span>
                  <span
                    className="text-gray-800"
                    onClick={() => fetchFileContent(`${fullPath}/${file.name}`, "HEAD")}
                  >
                    {file.name}
                  </span>
                  <span className="ml-auto text-gray-500">{file.changes || 0} cambios</span>
                  <button
                    onClick={() =>
                      navigate(
                        `/playback/${encodeURIComponent(repoUrl)}/${encodeURIComponent(
                          `${fullPath}/${file.name}`
                        )}`,
                        { state: { repoUrl } }
                      )
                    }
                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600"
                  >
                    Playback
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Visualizador Evolutivo de Código</h1>
        <p className="text-lg text-gray-600 mt-2">Ingresa la URL del repositorio para comenzar.</p>
      </header>

      <div className="max-w-3xl mx-auto mb-10">
        <FiltrosContribucionesYHeatMap
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          branch={branch}
          setBranch={setBranch}
          startDate={since}
          setStartDate={setSince}
          endDate={until}
          setEndDate={setUntil}
          fetchData={fetchTreeData}
          mode="bubbleChart"
          hideBranchSelect={false}
          includeAllBranchesOption={false}
        />
      </div>

      <div className="flex justify-center items-center gap-4 mb-10">
        {treeData.length > 0 && (
          <button
            onClick={clearRepository}
            className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
          >
            Seleccionar otro repositorio
          </button>
        )}
      </div>

      {loading && <p className="text-center text-blue-500">Cargando...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="container mx-auto px-4">
        {treeData.length > 0 ? (
          renderTree(treeData)
        ) : (
          !loading && <p className="text-center text-gray-600">No hay datos para mostrar.</p>
        )}
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedFile.path}</h2>
            <div className="p-4 border rounded bg-gray-100">
              <SyntaxHighlighter language="javascript" style={dracula}>
                {selectedFile.content}
              </SyntaxHighlighter>
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
              onClick={() => setSelectedFile(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizador;
