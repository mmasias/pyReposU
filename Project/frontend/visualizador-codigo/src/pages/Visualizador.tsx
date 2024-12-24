import React, { useState } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNavigate } from 'react-router-dom';

const Visualizador = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const navigate = useNavigate();

  const fetchTreeData = async () => {
    setLoading(true);
    setError(null);
    setTreeData([]);
    setSelectedFile(null);

    try {
      console.log(`[Visualizador] Solicitando árbol del repo con URL: ${repoUrl}`);
      const response = await axios.get(
        `http://localhost:3000/api/stats/tree?repoUrl=${encodeURIComponent(repoUrl)}`
      );
      console.log(`[Visualizador] Árbol de datos recibido:`, response.data);
      setTreeData(response.data.subfolders || []);
    } catch (err) {
      console.error(`[Visualizador] Error al cargar el árbol del repositorio:`, err);
      setError('Error al cargar el árbol del repositorio. Verifica la URL.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath: string, commitHash: string) => {
    try {
      setError(null);

      const cleanFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      console.log(`[Visualizador] Cargando contenido de archivo: ${cleanFilePath} en commit: ${commitHash}`);

      const response = await axios.get(`http://localhost:3000/api/files/content`, {
        params: {
          repoUrl,
          filePath: cleanFilePath,
          commitHash,
        },
      });

      console.log(`[Visualizador] Contenido del archivo cargado correctamente.`);
      setSelectedFile({ path: cleanFilePath, content: response.data });
    } catch (err) {
      console.error(`[Visualizador] Error al cargar el contenido del archivo:`, err);
      setError('Error al cargar el contenido del archivo.');
    }
  };

  const toggleFolder = (folderPath: string) => {
    console.log(`[Visualizador] Toggle folder: ${folderPath}`);
    if (expandedFolders.includes(folderPath)) {
      setExpandedFolders(expandedFolders.filter((path) => path !== folderPath));
    } else {
      setExpandedFolders([...expandedFolders, folderPath]);
    }
  };

  const renderTree = (nodes: any[], currentPath = '') => {
    return nodes.map((node, index) => {
      const fullPath = `${currentPath}/${node.name}`;

      return (
        <div key={index} className="ml-4 mt-2">
          {node.subfolders && (
            <div
              className="cursor-pointer flex items-center bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="mr-2">{expandedFolders.includes(fullPath) ? '📂' : '📁'}</span>
              <span className="font-semibold text-gray-800">{node.name}</span>
              <span className="ml-auto text-gray-500">{node.changes || 0} cambios</span>
            </div>
          )}

          {node.files && expandedFolders.includes(fullPath) && (
            <div className="ml-6 mt-2">
              {node.files.map((file: any, fileIndex: number) => (
                <div
                  key={fileIndex}
                  className="flex items-center bg-white hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
                >
                  <span className="mr-2">📄</span>
                  <span
                    className="text-gray-800 cursor-pointer"
                    onClick={() => fetchFileContent(`${fullPath}/${file.name}`, 'COMMIT_HASH')}
                  >
                    {file.name}
                  </span>
                  <span className="ml-auto text-gray-500">{file.changes || 0} cambios</span>
                  <button
                    onClick={() => {
                      console.log(`[Visualizador] Navegando a Playback con ruta completa: ${fullPath}/${file.name}`);
                      navigate(`/playback/${encodeURIComponent(repoUrl)}/${encodeURIComponent(`${fullPath}/${file.name}`)}`);
                    }}
                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600"
                  >
                    Playback
                  </button>
                </div>
              ))}
            </div>
          )}

          {expandedFolders.includes(fullPath) && node.subfolders && renderTree(node.subfolders, fullPath)}
        </div>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Visualizador Evolutivo de Código</h1>
        <p className="text-lg text-gray-600 mt-2">Ingresa la URL del repositorio para comenzar.</p>
      </header>

      <div className="flex justify-center items-center gap-4 mb-10">
        <input
          type="text"
          placeholder="https://github.com/usuario/repositorio.git"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-96 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={fetchTreeData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
        >
          Cargar Repositorio
        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedFile.path}</h2>
            <SyntaxHighlighter language="javascript" style={dracula}>
              {selectedFile.content}
            </SyntaxHighlighter>
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
