import React from "react";

interface HeatmapProps {
  data: any;
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const colorScale = (percentage: number) => {
    if (percentage > 75) return "bg-green-500";
    if (percentage > 50) return "bg-yellow-500";
    if (percentage > 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">📊 Mapa de Contribuciones</h3>
      <div className="grid grid-cols-4 gap-2">
        {Object.keys(data).map(user => (
          <div key={user} className="flex flex-col items-center">
            <p className="font-bold">{user}</p>
            <div className="grid grid-cols-4 gap-1">
              {Object.keys(data[user]).map(folder => (
                <div key={folder} className={`p-2 text-white ${colorScale(data[user][folder].percentage)}`} title={`${data[user][folder].percentage.toFixed(2)}%`}>
                  {folder}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
