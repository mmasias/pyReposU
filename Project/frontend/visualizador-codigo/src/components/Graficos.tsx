import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  userData: {
    user: string;
    commits: number;
    linesAdded: number;
    linesDeleted: number;
  }[];
}

const Graficos: React.FC<Props> = ({ userData }) => {
  const commitsData = {
    labels: userData.map((u) => u.user),
    datasets: [
      {
        label: "Commits",
        data: userData.map((u) => u.commits),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const linesData = {
    labels: userData.map((u) => u.user),
    datasets: [
      {
        label: "Líneas añadidas",
        data: userData.map((u) => u.linesAdded),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Líneas eliminadas",
        data: userData.map((u) => u.linesDeleted),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Commits por usuario</h3>
        <Bar data={commitsData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Líneas añadidas/eliminadas</h3>
        <Bar data={linesData} />
      </div>
    </div>
  );
};

export default Graficos;
