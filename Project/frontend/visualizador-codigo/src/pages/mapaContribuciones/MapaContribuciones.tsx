import React, { useState, useEffect } from "react";
import { fetchContributions, fetchBubbleChartData } from "../../services/contributionsService";
import Heatmap from "./HeatMap";
import BubbleChart from "./BubbleChart";
import FiltrosContribuciones from "./FiltrosContribuciones";    
import Layout from "../../components/Layout";

const MapaContribuciones: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [contributions, setContributions] = useState<any>(null);
  const [bubbleData, setBubbleData] = useState<any>(null);

  //     Definir fetchData y pasarlo a FiltrosContribuciones
  const fetchData = () => {
    if (!repoUrl) return;

    fetchContributions(repoUrl, branch, startDate, endDate)
      .then(data => setContributions(data))
      .catch(error => console.error("Error al obtener el mapa de calor:", error));

    fetchBubbleChartData(repoUrl, branch)
      .then(data => setBubbleData(data))
      .catch(error => console.error("Error al obtener el diagrama de burbujas:", error));
  };

  // Ejecutar fetchData cuando repoUrl cambie
  useEffect(() => {
    fetchData();
  }, [repoUrl, branch, startDate, endDate]);

  return (
    <Layout>
      <div className="space-y-6">
        <FiltrosContribuciones
          {...{ repoUrl, setRepoUrl, branch, setBranch, startDate, setStartDate, endDate, setEndDate, fetchData }}
        />

        {contributions && <Heatmap data={contributions} />}
        {bubbleData && <BubbleChart data={bubbleData} startDate={startDate} endDate={endDate} />}
      </div>
    </Layout>
  );
};

export default MapaContribuciones;
