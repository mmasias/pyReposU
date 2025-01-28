import React from "react";

const ExportarDatos = () => {
  const exportarCSV = () => {
    window.location.href = `http://localhost:3000/api/stats/user/export/csv?repoUrl=https://github.com/mmasias/pyReposU&branch=main&startDate=2024-01-01&endDate=2025-12-31`;
  };

  return (
    <div className="flex justify-center mt-6">
      <button onClick={exportarCSV} className="bg-green-500 text-white p-2 rounded">
        Exportar CSV
      </button>
    </div>
  );
};

export default ExportarDatos;
