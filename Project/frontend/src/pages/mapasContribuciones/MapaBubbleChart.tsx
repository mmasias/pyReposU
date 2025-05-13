import React, { useState } from "react";
import FiltrosContribuciones from "../../components/BarraConFiltros";
import BubbleChart from "./BubbleChart";
import { useBubbleChart } from "../../hooks/useBubbleChart";

const MapaBubbleChart: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { bubbleData, loading, fetchData } = useBubbleChart(repoUrl, branch);

  return (
    <>
      <FiltrosContribuciones
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        branch={branch}
        setBranch={setBranch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        fetchData={fetchData}
        mode="bubbleChart"  //  Esto evita que pida usuarios y ramas en filtroscontribucY...  
      />

      {loading ? (
        <div className="text-center text-gray-500">Cargando datos...</div>
      ) : (
        bubbleData && <BubbleChart data={bubbleData} startDate={startDate} endDate={endDate} />
      )}
    </>
  );
};

export default MapaBubbleChart;
