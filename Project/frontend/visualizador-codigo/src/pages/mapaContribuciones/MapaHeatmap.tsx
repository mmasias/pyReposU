import React, { useState } from "react";
import FiltrosContribuciones from "../../components/FiltrosContribucionesYHeatMap";
import Heatmap from "./HeatMap";
import { useContributions } from "../../hooks/useContributions";

const MapaHeatmap: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { contributions, loading, fetchData } = useContributions(repoUrl, branch, startDate, endDate);

  return (
    <>
      <FiltrosContribuciones {...{ repoUrl, setRepoUrl, branch, setBranch, startDate, setStartDate, endDate, setEndDate, fetchData }} />

      {loading ? (
        <div className="text-center text-gray-500">Cargando datos...</div>
      ) : (
        contributions && <Heatmap data={contributions} /> 
      )}
    </>
  );
};

export default MapaHeatmap;
