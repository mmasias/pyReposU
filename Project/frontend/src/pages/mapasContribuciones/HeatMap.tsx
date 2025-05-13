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

  console.log(" Datos recibidos en Heatmap:", data);
  console.log(" ¿docs/recursos/imagenes está en data?", data.hasOwnProperty("docs/recursos/imagenes"));

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500"> No hay datos disponibles para el heatmap.</div>;
  }

  //  Lista de usuarios únicos (Eje X)
  const users: string[] = Array.from(new Set(Object.values(data).flatMap((fileData) => Object.keys(fileData))));

  //  Construcción del árbol de archivos (Incluyendo carpetas sin archivos de texto)
  const fileTree: Record<string, string[]> = { ROOT: [] };
  const folders: Set<string> = new Set();

  Object.keys(data).forEach((filePath) => {
    const parts = filePath.split("/");
  
    for (let i = 1; i < parts.length; i++) {
      const folder = parts.slice(0, i).join("/");
      folders.add(folder); 
  
      if (!fileTree[folder]) {
        fileTree[folder] = []; 
      }
  
      const parent = parts.slice(0, i - 1).join("/") || "ROOT"; 
      if (!fileTree[parent]) {
        fileTree[parent] = [];
      }
      if (!fileTree[parent].includes(folder)) {
        fileTree[parent].push(folder);
      }
    }
  
    //  Agregar el archivo a su carpeta padre
    const parentFolder = parts.slice(0, -1).join("/") || "ROOT";
    if (!fileTree[parentFolder]) {
      fileTree[parentFolder] = [];
    }
    fileTree[parentFolder].push(filePath);
  });
  
  //  Verifica que ROOT tiene archivos y carpetas
  console.log(" Árbol de archivos FINAL:", fileTree);

  console.log(" Árbol de archivos construido:", fileTree);
  console.log(" Contenido de fileTree[docs/recursos]:", fileTree["docs/recursos"]);
  console.log(" Contenido de fileTree[docs/recursos/imagenes]:", fileTree["docs/recursos/imagenes"]);

  folders.forEach((folder) => {
    const parent = folder.split("/").slice(0, -1).join("/");
    if (!fileTree[parent]) fileTree[parent] = [];
    if (!fileTree[parent].includes(folder)) {
      fileTree[parent].push(folder);
    }
  });

  useEffect(() => {
    if (Object.keys(expandedFolders).length === 0) {  // Solo la primera vez
      const initialExpanded: Record<string, boolean> = {};
      folders.forEach((folder) => {
        initialExpanded[folder] = false;
      });
      setExpandedFolders(initialExpanded);
    }
  }, []); 

  //  Obtener archivos en el orden correcto
const getVisibleFiles = (): string[] => {
  const visible: string[] = [];

  const visit = (parent: string) => {
    const children = fileTree[parent] || [];

    const foldersFirst = children
      .slice()
      .sort((a, b) => {
        const aIsFolder = folders.has(a);
        const bIsFolder = folders.has(b);

        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;

        return a.localeCompare(b);
      });

    foldersFirst.forEach((child) => {
      if (!visible.includes(child)) {
        visible.push(child);
      }

      if (folders.has(child) && expandedFolders[child]) {
        visit(child);
      }
    });
  };

  visit("ROOT");
  if (!visible.includes("TOTAL")) visible.push("TOTAL");

  return visible;
};

  
  useEffect(() => {
    setVisibleFiles(getVisibleFiles());
  }, [expandedFolders, data]);
  const formatFileName = (filePath: string): string => {
    const parts = filePath.split("/");
    if (parts.length <= 1) return filePath;
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  };

  //const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);
// Escala de colores segmentada en rangos de 10 en 10 
const colorScale = d3.scaleThreshold<number, string>()
  .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])  
  .range([
    "#8B0000", // 0-10 (Rojo oscuro intenso)
    "#C0392B", // 10-20 (Rojo vibrante)
    "#E74C3C", // 20-30 (Rojo anaranjado)
    "#FF5733", // 30-40 (Naranja fuerte)
    "#FF8C00", // 40-50 (Naranja intenso)
    "#F4D03F", // 50-60 (Amarillo dorado)
    "#FFD700", // 60-70 (Dorado brillante)
    "#ADFF2F", // 70-80 (Verde lima)
    "#32CD32", // 80-90 (Verde vibrante)
    "#008000"  // 90-100 (Verde intenso)
  ]);
  const [visibleFiles, setVisibleFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cellSize = 40;
    const y = (index: number) => margin.top + index * cellSize;

    const extraLegendSpace = 120; 
    const heatmapWidth = users.length * cellSize + 350; //  Mantiene el heatmap sin cambios
    const svgWidth = heatmapWidth + extraLegendSpace; 

    const margin = { top: 150, right: 20, bottom: 50, left: 300 };
    const height = margin.top + margin.bottom + visibleFiles.length * cellSize;

    const xScale = d3.scaleBand<string>().domain(users).range([margin.left, heatmapWidth]).padding(0.1);

      
    svg.attr("width", svgWidth).attr("height", height);

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
    .attr("transform", `translate(${margin.left - 10},0)`); 

  // Renderiza manualmente los labels (texto) Y
  yAxis.selectAll("text")
    .data(visibleFiles)
    .enter()
    .append("text")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .attr("x", 0)
    .attr("y", (_, i) => y(i) + cellSize / 2 + 5)
    .attr("text-anchor", "end")
    .style("font-size", "13px")
    .style("cursor", (filePath) => (folders.has(filePath) ? "pointer" : "default"))
    .style("fill", (filePath) => (expandedFolders[filePath] ? "blue" : "black"))
    .style("font-weight", (filePath) => (folders.has(filePath) ? "bold" : "normal"))
    .text((filePath) => {
      const depth = (filePath.match(/\//g) || []).length;
      const isFolder = folders.has(filePath);
      const prefix = " ".repeat(depth * 2); // sangría visual
      return isFolder
        ? `${expandedFolders[filePath] ? "🔽" : "▶️"} ${prefix}${formatFileName(filePath)}`
        : `${prefix}${formatFileName(filePath)}`;
    })
    .on("click", function (_, filePath) {
      if (folders.has(filePath)) {
        setExpandedFolders((prev) => ({
          ...prev,
          [filePath]: !prev[filePath],
        }));
      }
    });

    console.log(" Renderizando heatmap con archivos:", visibleFiles);

    //  Renderizar las celdas del heatmap (incluyendo "TOTAL")
    visibleFiles.forEach((file) => {
      users.forEach((user) => {
        const percentage = data[file]?.[user]?.percentage || 0;

        svg.append("rect")
          .attr("x", xScale(user as string) ?? 0)
          .attr("y", y(visibleFiles.indexOf(file)))
          .attr("width", xScale.bandwidth() || 10)
          .attr("height", cellSize)
          .attr("fill", colorScale(percentage)) 
          .attr("stroke", "white")
          .on("mouseover", function (event) {

            d3.select("#d3-tooltip").remove();
          
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
                `<strong>${file === "TOTAL" ? "📊 TOTAL" : file}</strong><br>👤 ${user}<br> ${percentage.toFixed(2)}%`
              )
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY}px`);
          })
          .on("mouseout", function () {
            d3.select("#d3-tooltip").remove(); 
          });
      });
    });

    //  Agregar la leyenda de colores
    const legendWidth = 20;
    const legendHeight = 200;
    //const legendMargin = { top: 50, right: 50 };

    // Escala de colores para la leyenda
    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([legendHeight, 0]);

    // Gradiente de colores para la leyenda
    const legendAxis = d3.axisRight(legendScale)
      .tickValues([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      .tickFormat(d => `${d}%`);

    // Contenedor de la leyenda
    const legend = svg.append("g")
      .attr("transform", `translate(${heatmapWidth + 30}, ${margin.top})`); //  Mueve la leyenda a la derecha correctamente
  

    // Definir gradiente
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");

    // Agregar los colores al gradiente
    colorScale.domain().forEach((d, i) => {
      linearGradient.append("stop")
        .attr("offset", `${(i / (colorScale.domain().length - 1)) * 100}%`)
        .attr("stop-color", colorScale(d as number));
    });

    // Dibujar el rectángulo de la leyenda
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "black");

    // Agregar el eje con las etiquetas de porcentaje
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "12px");

  }, [data, visibleFiles]);

  return <div
  style={{
    overflow: "auto",
    maxHeight: "80vh",
    width: "100%", //  Evita que el heatmap se desborde
    minHeight: visibleFiles.length * 40 + 200, //  Asegura altura mínima correcta
  }}
  key={JSON.stringify(expandedFolders)} //  Evita que el SVG se regenere
>
  <svg ref={svgRef} className="heatmap-container"></svg>
</div>
};

export default Heatmap;
