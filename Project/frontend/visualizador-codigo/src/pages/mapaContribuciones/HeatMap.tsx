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
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [visibleFiles, setVisibleFiles] = useState<string[]>([]);

  //  Log de los datos que recibe el frontend
  console.log(" Datos recibidos en Heatmap:", data);
  console.log(" ¿docs/recursos/imagenes está en data?", data.hasOwnProperty("docs/recursos/imagenes"));


  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500">📉 No hay datos disponibles para el heatmap.</div>;
  }

  //  Lista de usuarios únicos (Eje X)
  const users: string[] = Array.from(new Set(Object.values(data).flatMap((fileData) => Object.keys(fileData))));

  //  Construcción del árbol de archivos (Incluyendo carpetas sin archivos de texto)
  const fileTree: Record<string, string[]> = { ROOT: [] };
  const folders: Set<string> = new Set();

  Object.keys(data).forEach((filePath) => {
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

  //  Log de la estructura del árbol de archivos
  console.log(" Árbol de archivos construido:", fileTree);
  console.log(" Contenido de fileTree[docs/recursos]:", fileTree["docs/recursos"]);
  console.log(" Contenido de fileTree[docs/recursos/imagenes]:", fileTree["docs/recursos/imagenes"]);

  //  Asegurar que TODAS las carpetas aparecen en `fileTree`, aunque solo tengan imágenes
  folders.forEach((folder) => {
    const parent = folder.split("/").slice(0, -1).join("/");
    if (!fileTree[parent]) fileTree[parent] = [];
    if (!fileTree[parent].includes(folder)) {
      fileTree[parent].push(folder);
    }
  });

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    folders.forEach((folder) => {
      initialExpanded[folder] = false;
    });
    setExpandedFolders(initialExpanded);
  }, []);

  //  Obtener archivos en el orden correcto
  const getVisibleFiles = (): string[] => {
    let files: string[] = [...fileTree["ROOT"]].filter(file => file !== ".");

    const addChildrenRecursively = (parent: string) => {
      if (expandedFolders[parent]) {
        const children = fileTree[parent] || [];
        children.forEach(child => {
          if (!files.includes(child)) {
            files.push(child);
            if (folders.has(child)) {
              addChildrenRecursively(child);
            }
          }
        });
      }
    };

    [...fileTree["ROOT"]].forEach(rootFolder => {
      if (folders.has(rootFolder)) {
        addChildrenRecursively(rootFolder);
      }
    });

    return files;
  };

  useEffect(() => {
    setVisibleFiles(getVisibleFiles());
  }, [expandedFolders]);

  //  Log antes de renderizar el heatmap para ver qué archivos/carpeta están en la lista final
  console.log(" Archivos y carpetas visibles antes del render:", visibleFiles);
  console.log(" ¿docs/recursos/imagenes está en visibleFiles?", visibleFiles.includes("docs/recursos/imagenes"));


  //  Función para mostrar solo el padre inmediato en la izquierda
  const formatFileName = (filePath: string): string => {
    const parts = filePath.split("/");
    if (parts.length <= 1) return filePath;
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  };

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

    //  Eje X (Usuarios)
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(xScale).tickSize(0));

    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("text-anchor", "start")
      .attr("dx", "-5px")
      .attr("dy", "-5px")
      .attr("transform", "rotate(-30)");

    //  Eje Y (Archivos/Carpetas)
    const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(0));

    yAxis.selectAll("text")
      .style("cursor", (filePath) => (folders.has(filePath as string) ? "pointer" : "default"))
      .style("fill", (filePath) => (expandedFolders[filePath as string] ? "blue" : "black"))
      .style("font-weight", (filePath) => (folders.has(filePath as string) ? "bold" : "normal"))
      .style("text-indent", (filePath) => `${((filePath as string).split("/").length - 1) * 15}px`)
      .text((filePath) => {
        const path = filePath as string;
        const isFolder = folders.has(path);
        return isFolder ? (expandedFolders[path] ? `🔽 ${formatFileName(path)}` : `▶️ ${formatFileName(path)}`) : `📄 ${formatFileName(path)}`;
      })
      .on("click", function (_, filePath) {
        const folderName = filePath as string;
        if (folders.has(folderName)) {
          setExpandedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName]
          }));
          console.log(` Expandiendo/cerrando carpeta: ${folderName}`);
          console.log(" Estado de expandedFolders después del cambio:", expandedFolders);

        }
      });

    //  Log de los archivos que se están pintando en el heatmap
    console.log(" Renderizando heatmap con archivos:", visibleFiles);

    //  Renderizar las celdas del heatmap
    visibleFiles.forEach((file) => {
      users.forEach((user) => {
        const percentage = data[file]?.[user]?.percentage || 0;

        svg.append("rect")
          .attr("x", xScale(user as string) ?? 0)
          .attr("y", yScale(file as string) ?? 0)
          .attr("width", xScale.bandwidth() || 10)
          .attr("height", yScale.bandwidth() || 10)
          .attr("fill", colorScale(percentage))
          .attr("stroke", "white")
          .on("mouseover", function (event) {
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
                `<strong>${file}</strong><br>👤 ${user}<br> ${percentage.toFixed(2)}%`
              )
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY}px`);
          })
          .on("mouseout", function () {
            d3.select("#d3-tooltip").remove();
          });
      });
    });

  }, [data, visibleFiles]);

  return <svg ref={svgRef} className="heatmap-container"></svg>;
};

export default Heatmap;
