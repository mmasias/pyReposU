import React, { useState } from "react";
import FiltrosContribuciones from "../../components/FiltrosContribucionesYHeatMap";
import { useContributions } from "../../hooks/useContributions";
import Heatmap from "./HeatMap";

const MapaHeatmap: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { contributions, loading, fetchContributions } = useContributions(repoUrl, branch, startDate, endDate);

  return (
    <>
      <FiltrosContribuciones 
        {...{ repoUrl, setRepoUrl, branch, setBranch, startDate, setStartDate, endDate, setEndDate, fetchData: fetchContributions, mode: "heatmap" }} 
      />

      {loading ? (
        <div className="text-center text-gray-500">Cargando datos...</div>
      ) : (
        contributions && <Heatmap data={contributions} /> 
      )}
    </>
  );
};

export default MapaHeatmap;
