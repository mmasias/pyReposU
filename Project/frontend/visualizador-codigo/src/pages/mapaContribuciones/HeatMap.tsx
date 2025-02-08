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
  const [visibleFiles, setVisibleFiles] = useState<string[]>([]);

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500">    No hay datos disponibles para el heatmap.</div>;
  }

  //     Lista de usuarios únicos (EJE X)
  const users: string[] = Array.from(new Set(Object.values(data).flatMap((fileData) => Object.keys(fileData))));

  //     Construcción del árbol de archivos
  const fileTree: Record<string, string[]> = { ROOT: [] };
  const folders: Set<string> = new Set();

  Object.keys(data).forEach((filePath) => {
    if (filePath === ".") return;
    const parts = filePath.split("/");
    if (parts.length === 1) {
      fileTree["ROOT"].push(filePath);
    } else {
      const folder = parts.slice(0, -1).join("/");
      folders.add(folder);
      if (!fileTree[folder]) fileTree[folder] = [];
      fileTree[folder].push(filePath);

      if (!fileTree["ROOT"].includes(parts[0])) {
        fileTree["ROOT"].push(parts[0]);
      }
    }
  });

  if (Object.keys(fileTree).some(folder => folder.startsWith("docs/"))) {
    folders.add("docs");
  }

  console.log("    Estructura de carpetas:", fileTree);
  console.log("    Carpetas detectadas:", folders);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    folders.forEach((folder) => {
      initialExpanded[folder] = false;
    });
    setExpandedFolders(initialExpanded);
  }, []);

  //     Obtener archivos visibles con indentación
  const getVisibleFiles = (): string[] => {
    let files: string[] = [...fileTree["ROOT"]].filter(file => file !== ".");
    Object.keys(expandedFolders).forEach((folder) => {
      if (expandedFolders[folder]) {
        files = [
          ...files,
          ...Object.keys(fileTree).filter(subFolder => subFolder.startsWith(folder + "/")),
          ...(fileTree[folder] || [])
        ];
      }
    });

    return Array.from(new Set(files));
  };

  useEffect(() => {
    setVisibleFiles(getVisibleFiles());
  }, [expandedFolders]);

  console.log("👀 Archivos visibles ahora:", visibleFiles);
  console.log("👤 Usuarios detectados:", users);

  const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cellSize = 40;
    const width = users.length * cellSize + 350;
    const height = visibleFiles.length * cellSize + 200;

    const margin = { top: 150, right: 20, bottom: 50, left: 300 };
    const xScale = d3.scaleBand<string>().domain(users).range([margin.left, width]).padding(0.1);
    const yScale = d3.scaleBand<string>().domain(visibleFiles).range([margin.top, height]).padding(0.1);

    svg.attr("width", width).attr("height", height);

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(xScale).tickSize(0));

    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("text-anchor", "start")
      .attr("dx", "-5px")
      .attr("dy", "-5px")
      .attr("transform", "rotate(-30)");

    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(0));

    yAxis.selectAll("text")
      .style("cursor", (filePath) => (folders.has(filePath as string) ? "pointer" : "default"))
      .style("fill", (filePath) => (expandedFolders[filePath as string] ? "blue" : "black"))
      .style("font-weight", (filePath) => (folders.has(filePath as string) ? "bold" : "normal"))
      .style("opacity", (filePath) => {
        const path = filePath as string;
        return 1 - (path.split("/").length * 0.1);
      })
      .style("margin-left", (filePath) => {
        const path = filePath as string;
        return `${path.split("/").length * 10}px`;
      })
      .text((filePath) => {
        const path = filePath as string;
        const isFolder = folders.has(path);
        return isFolder ? (expandedFolders[path] ? `🔽 ${path}` : `▶️ ${path}`) : path;
      })
      .on("click", function (_, filePath) {
        const folderName = filePath as string;
        if (folders.has(folderName)) {
          setExpandedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName]
          }));
          console.log(`    Expandiendo/cerrando carpeta: ${folderName}`);
        }
      });

    visibleFiles.forEach((file) => {
      users.forEach((user) => {
        svg.append("rect")
          .attr("x", xScale(user as string) ?? 0)
          .attr("y", yScale(file as string) ?? 0)
          .attr("width", xScale.bandwidth() || 10)
          .attr("height", yScale.bandwidth() || 10)
          .attr("fill", colorScale(data[file]?.[user]?.percentage || 0))
          .attr("stroke", "white")
          .on("mouseover", function (event) {
            const percentage = data[file]?.[user]?.percentage || 0;
            d3.select("body")
              .append("div")
              .attr("id", "d3-tooltip")
              .style("position", "absolute")
              .style("background", "#333")
              .style("color", "#fff")
              .style("padding", "6px 10px")
              .style("border-radius", "5px")
              .style("font-size", "14px")
              .style("pointer-events", "none")
              .style("z-index", "1000")
              .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
              .html(
                `<strong>    ${file}</strong><br>👤 ${user}<br>    ${percentage.toFixed(2)}%`
              )
              .style("left", `${event.pageX}px`)  
              .style("top", `${event.pageY}px`); 
          })
          .on("mousemove", function (event) {
            d3.select("#d3-tooltip")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY}px`);
          })
          .on("mouseout", function () {
            d3.select("#d3-tooltip").remove();
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
      <div ref={tooltipRef} className="tooltip" style={{
        position: "absolute",
        display: "none",
        backgroundColor: "#333",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "5px",
        fontSize: "14px",
        pointerEvents: "none",
        zIndex: 1000,
      }}></div>
    </div>
  );
};

export default Heatmap;
