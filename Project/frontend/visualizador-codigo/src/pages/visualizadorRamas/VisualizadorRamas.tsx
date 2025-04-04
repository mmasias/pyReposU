import React, { useState } from "react";
import CommitGraph from "../../components/CommitGraph";

const VisualizadorRamas = () => {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedUrl(url);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Visualizador de Ramas tipo GitKraken</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Introduce la URL del repositorio"
          className="border border-gray-400 rounded px-3 py-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Visualizar
        </button>
      </form>

      {submittedUrl && (
        <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
          <CommitGraph repoUrl={submittedUrl} />
        </div>
      )}
    </div>
  );
};

export default VisualizadorRamas;
