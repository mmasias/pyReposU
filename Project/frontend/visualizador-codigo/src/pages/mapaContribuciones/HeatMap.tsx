import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface ContributionStats {
  [filePath: string]: {
    [user: string]: { linesAdded: number; linesDeleted: number; percentage: number };
  };
}

interface HeatmapProps {
  data: ContributionStats;
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500">📉 No hay datos disponibles para el heatmap.</div>;
  }

  const users: string[] = Array.from(new Set(Object.values(data).flatMap((fileData) => Object.keys(fileData))));

  const cleanPath = (path: string) => path.replace(/\{.*?=>\s*|\}/g, "").trim();

  const fileTree: Record<string, string[]> = { ROOT: [] };

  Object.keys(data).forEach((rawPath: string) => {
    const filePath = cleanPath(rawPath);
    if (!filePath.includes("/")) {
      fileTree["ROOT"].push(filePath);
    } else {
      const parts = filePath.split("/");
      const folder = parts.slice(0, -1).join("/");
      if (!fileTree[folder]) fileTree[folder] = [];
      fileTree[folder].push(filePath);
      if (!fileTree["ROOT"].includes(parts[0])) {
        fileTree["ROOT"].push(parts[0]);
      }
    }
  });

  console.log("📂 Estructura de carpetas corregida:", fileTree);

  const rootItems: string[] = fileTree["ROOT"].filter((item) => item === "README.md" || item === "docs");

  const getVisibleFiles = (): string[] => {
    let visibleFiles: string[] = [...rootItems];

    Object.entries(expandedFolders).forEach(([folder, isExpanded]) => {
      if (isExpanded && fileTree[folder]) {
        const index = visibleFiles.indexOf(folder);
        if (index !== -1) {
          visibleFiles.splice(index + 1, 0, ...fileTree[folder]);
        }
      }
    });

    return visibleFiles;
  };

  const visibleFiles = getVisibleFiles();
  console.log("👀 Archivos visibles ahora:", visibleFiles);

  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cellSize = 40;
    const width = users.length * cellSize + 250;
    const height = (visibleFiles.length + 1) * cellSize + 200;
    const margin = { top: 150, right: 20, bottom: 50, left: 350 };

    const xScale = d3.scaleBand<string>().domain(users).range([margin.left, width]).padding(0.1);
    const yScale = d3.scaleBand<string>().domain([...visibleFiles, "TOTAL"]).range([margin.top, height]).padding(0.1);

    svg.attr("width", width).attr("height", height);

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(xScale).tickSize(0));

    xAxis.selectAll("text")
      .style("font-size", "14px")
      .style("text-anchor", "start")
      .attr("dx", "-10px")
      .attr("dy", "-5px")
      .attr("transform", "rotate(-30)");

    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(0));

    yAxis.selectAll("text")
      .style("font-size", "16px")
      .style("cursor", (filePath) => (fileTree[filePath as string] ? "pointer" : "default"))
      .on("click", (_, filePath) => {
        const folderName = filePath as string;
        if (fileTree[folderName]) {
          setExpandedFolders((prev) => {
            const newExpanded = { ...prev, [folderName]: !prev[folderName] };
            console.log("📂 Carpetas expandidas ahora:", newExpanded);
            return newExpanded;
          });
        }
      });

    visibleFiles.forEach((file) => {
      users.forEach((user) => {
        svg.append("rect")
          .attr("x", xScale(user as string)!)
          .attr("y", yScale(file as string)!)
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", colorScale(data[file]?.[user]?.percentage || 0))
          .attr("stroke", "white")
          .on("mouseover", (event) => {
            const percentage = data[file]?.[user]?.percentage || 0;
            if (tooltipRef.current) {
              tooltipRef.current.style.display = "block";
              tooltipRef.current.style.left = `${event.clientX + 15}px`; // 🔧 Ahora sigue al cursor
              tooltipRef.current.style.top = `${event.clientY - 10}px`;
              tooltipRef.current.innerHTML = `<strong>📂 ${file}</strong><br>👤 ${user}<br>    ${percentage.toFixed(2)}%`;
            }
          })
          .on("mousemove", (event) => {
            if (tooltipRef.current) {
              tooltipRef.current.style.left = `${event.clientX + 15}px`;
              tooltipRef.current.style.top = `${event.clientY - 10}px`;
            }
          })
          .on("mouseout", () => {
            if (tooltipRef.current) tooltipRef.current.style.display = "none";
          });
      });
    });

  }, [data, visibleFiles]);

  return (
    <div className="p-6 bg-white rounded-lg shadow relative overflow-auto">
      <h3 className="text-xl font-semibold mb-4">📊 Mapa de Contribuciones</h3>
      <div className="w-full overflow-auto">
        <svg ref={svgRef}></svg>
      </div>
      <div
        ref={tooltipRef}
        style={{
          position: "fixed", //     AHORA NO EXPANDE EL CONTENEDOR
          display: "none",
          backgroundColor: "#333",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "5px",
          fontSize: "14px",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      ></div>
    </div>
  );
};

export default Heatmap;
