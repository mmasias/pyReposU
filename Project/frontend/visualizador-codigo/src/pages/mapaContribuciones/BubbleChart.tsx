import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, TooltipItem } from "chart.js";
import { Bubble } from "react-chartjs-2";
import {
  LinearScale,
  TimeScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

//     Registrar escalas y plugins en Chart.js
ChartJS.register(LinearScale, TimeScale, CategoryScale, PointElement, Tooltip, Legend, zoomPlugin);

interface CommitEntry {
  date: string;
  linesAdded: number;
  linesDeleted: number;
  hash: string;
  message: string;
  files: string[];
}

interface BubbleChartProps {
  data: Record<string, CommitEntry[]>;
  startDate: string;
  endDate: string;
}

// 🎨 Genera un color único basado en el nombre del usuario
const generateColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const BubbleChart: React.FC<BubbleChartProps> = ({ data, startDate, endDate }) => {
  useEffect(() => {
    console.log("📊 Datos para burbujas:", data);
  }, [data]);

  const users = Object.keys(data);

  // 🔍 Encontrar el máximo de líneas modificadas (añadidas + borradas)
  const allLinesModified = users.flatMap(user =>
    data[user].map(commit => commit.linesAdded + commit.linesDeleted)
  );
  const maxLinesModified = Math.max(...allLinesModified, 1);
  console.log("🔍 Máximo de líneas modificadas:", maxLinesModified);

  const datasets = users.map(user => ({
    label: user,
    data: data[user].map(entry => ({
      x: new Date(entry.date).getTime(),
      y: user,
      r: Math.max(5, ((entry.linesAdded + entry.linesDeleted) / maxLinesModified) * 30),
    })) as { x: number; y: string; r: number }[], //     FIX: Asegurar tipo correcto
    backgroundColor: generateColor(user),
    extraData: data[user].map(entry => ({
      hash: entry.hash || "Desconocido",
      message: entry.message || "Sin mensaje",
      files: entry.files || ["No disponible"],
      linesAdded: entry.linesAdded,
      linesDeleted: entry.linesDeleted
    })), //     Guardamos datos adicionales en `extraData`
  }));

  const options: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "PPpp",
        },
        suggestedMin: new Date(startDate).getTime(),
        suggestedMax: new Date(endDate).getTime(),
        title: { display: true, text: "Fecha" },
      },
      y: {
        type: "category",
        labels: users,
        title: { display: true, text: "Usuarios" },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"bubble">) => {
            const dataset = datasets[tooltipItem.datasetIndex!];
            const extraData = dataset.extraData![tooltipItem.dataIndex];

            return [
              `👤 Usuario: ${tooltipItem.dataset.label}`,
              `🆔 Commit: ${extraData.hash}`,
              `📝 ${extraData.message || "Sin mensaje"}`,
              `📂 Archivos: ${(extraData.files && extraData.files.length > 0) ? extraData.files.join(", ") : "No disponible"}`,
              `➕ Líneas añadidas: ${extraData.linesAdded ?? 0}`,
              `➖ Líneas borradas: ${extraData.linesDeleted ?? 0}`,
            ];
          },
        },
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow" style={{ height: "450px" }}>
      <h3 className="text-xl font-semibold mb-4">📊 Diagrama de Burbujas</h3>
      <Bubble data={{ datasets }} options={options} />
    </div>
  );
};

export default BubbleChart;
