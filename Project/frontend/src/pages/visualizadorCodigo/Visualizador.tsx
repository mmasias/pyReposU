import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ERROR_MESSAGES, CONSOLE_LOG_MESSAGES } from "../../utils/constants/errorConstants";

const Visualizador = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [author, setAuthor] = useState("");

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
      loadBranches(savedRepoUrl);
      loadAuthorsAndDates(savedRepoUrl);

      if (savedRepoUrl !== sessionStorage.getItem("repoUrl") || !sessionStorage.getItem("treeData")) {
        fetchTreeData(savedRepoUrl, savedBranch);
      } else {
        setTreeData(JSON.parse(sessionStorage.getItem("treeData") || "[]"));
      }
    }
  }, [location.state]);

  const loadBranches = async (url: string) => {
    try {
      const res = await axios.get("http://localhost:3000/api/analisisMultidimensional/branches", {
        params: { repoUrl: url },
      });
      setAvailableBranches(res.data);
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.ERROR_LOADING_BRANCHES, err);
    }
  };

  const loadAuthorsAndDates = async (url: string) => {
    try {
      const res = await axios.get("http://localhost:3000/api/visualizadorCodigo", { params: { repoUrl: url } });
      const commits = res.data;
      const authors = Array.from(new Set(commits.map((c: any) => c.author)));
      setAvailableAuthors(authors as string[]);

      if (commits.length > 0) {
        setSince(commits[commits.length - 1].date.split("T")[0]);
        setUntil(commits[0].date.split("T")[0]);
      }
    } catch (err) {
      console.error(CONSOLE_LOG_MESSAGES.ERROR_LOADING_AUTHORS_DATES, err);
    }
  };

  const fetchTreeData = async (url?: string, branchOverride?: string) => {
    setLoading(true);
    setError(null);
    setTreeData([]);
    setSelectedFile(null);

    try {
      const repo = url || repoUrl;
      let selectedBranch = branchOverride || branch;
      const params: Record<string, string> = { repoUrl: repo };

      if (selectedBranch) params.branch = selectedBranch;
      if (since) params.since = since;
      if (until) params.until = until;
      if (author) params.author = author;

      const res = await axios.get("http://localhost:3000/api/visualizadorCodigo/tree", { params });

      if (res.data.warning) alert(res.data.warning);
      const rootTree = res.data.tree;
      const rootFiles = rootTree.files || [];
      const subfolders = rootTree.subfolders || [];
      
      setTreeData([...subfolders, { files: rootFiles }]);
      
      
      
      if (!selectedBranch) {
        const headRes = await axios.get("http://localhost:3000/api/visualizadorCodigo/current-branch", {
          params: { repoUrl: repo },
        });
        selectedBranch = headRes.data.currentBranch;
        setBranch(selectedBranch);
      }

      sessionStorage.setItem("repoUrl", repo);
      sessionStorage.setItem("branch", selectedBranch);
      sessionStorage.setItem("treeData", JSON.stringify(res.data.tree.subfolders || []));
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
      const res = await axios.get("http://localhost:3000/api/visualizadorCodigo/content", {
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
  };

  const renderTree = (nodes: any[], currentPath = "") =>
    nodes.map((node, idx) => {
      const fullPath = node.name ? `${currentPath}/${node.name}` : currentPath;
  
      return (
        <div key={idx} className="ml-4 mt-2">
          {/* 🗂️ Carpeta */}
          {node.name && node.subfolders && (
            <div
              className="cursor-pointer flex items-center bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="font-semibold text-gray-800">{node.name}</span>
              <span className="ml-auto text-gray-500">{node.changes || 0} cambios</span>
            </div>
          )}
  
          {/* 📁 Subcarpetas recursivas */}
          {expandedFolders.includes(fullPath) && node.subfolders && renderTree(node.subfolders, fullPath)}
  
          {/*  Archivos */}
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

      {/* Filtros */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input border px-4 py-2 rounded-md">
          <option value="">Seleccionar rama</option>
          {availableBranches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="input" />
        <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="input" />
        <select value={author} onChange={(e) => setAuthor(e.target.value)} className="input border px-4 py-2 rounded-md">
          <option value="">Todos los autores</option>
          {availableAuthors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button onClick={() => fetchTreeData()} className="btn-primary">
          Aplicar Filtros
        </button>
      </div>

      {/* Cargar o Limpiar Repositorio */}
      <div className="flex justify-center items-center gap-4 mb-10">
        {treeData.length > 0 ? (
          <button
            onClick={clearRepository}
            className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600"
          >
            Seleccionar otro repositorio
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="https://github.com/usuario/repositorio.git"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-96 px-4 py-2 rounded-md border border-gray-300 shadow-sm"
            />
            <button
              onClick={() => {
                fetchTreeData();
                loadBranches(repoUrl);
                loadAuthorsAndDates(repoUrl);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
            >
              Cargar Repositorio
            </button>
          </>
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

      {/* Modal de archivo */}
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
