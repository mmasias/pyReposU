import React from "react";

interface ExportarDatosProps {
  repoUrl: string;
  branch: string;
  startDate: string;
  endDate: string;
}

const ExportarDatos: React.FC<ExportarDatosProps> = ({ repoUrl, branch, startDate, endDate }) => {
  const exportarCSV = () => {
    if (!repoUrl) {
      console.error("No se puede exportar, repoUrl es undefined");
      return;
    }

    window.location.href = `http://localhost:3000/api/stats/user/export/csv?repoUrl=${encodeURIComponent(repoUrl)}&branch=${encodeURIComponent(branch)}&startDate=${startDate}&endDate=${endDate}`;
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
