import React from "react";
import { ERROR_MESSAGES } from "../../utils/constants/errorConstants";

interface ExportarDatosProps {
  repoUrl: string;
  branch: string;
  startDate: string;
  endDate: string;
}

const ExportarDatos: React.FC<ExportarDatosProps> = ({ repoUrl, branch, startDate, endDate }) => {
  const exportarCSV = () => {
    if (!repoUrl) {
      console.error(ERROR_MESSAGES.CANNOT_EXPORT_NO_REPO_URL);
      return;
    }

    window.location.href = `http://localhost:3000/api/analisisMultidimensional/export/csv?repoUrl=${encodeURIComponent(repoUrl)}&branch=${encodeURIComponent(branch)}&startDate=${startDate}&endDate=${endDate}`;
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
