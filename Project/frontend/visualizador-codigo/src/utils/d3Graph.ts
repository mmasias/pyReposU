// src/utils/d3Graph.ts
import * as d3 from "d3";

interface Commit {
  sha: string;
  message: string;
  primaryBranch: string;
  parents: string[];
  date: string;
  author: string;
  branches: string[];
}

export function drawGraph(container: HTMLElement, commits: Commit[]) {
  container.innerHTML = "";

  const width = container.clientWidth;
  const height = commits.length * 60 + 100;
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // --- ASIGNACIÓN DINÁMICA DE X POR FLUJO DE COMMITS ---
  const positionMap = new Map<string, number>();
  let currentX = 0;

  for (const commit of commits) {
    const parentSha = commit.parents[0];
    const parentX = parentSha ? positionMap.get(parentSha) : undefined;

    if (parentX !== undefined) {
      positionMap.set(commit.sha, parentX);
    } else {
      positionMap.set(commit.sha, currentX++);
    }
  }

  // --- NODOS ---
  const nodes = commits.map((commit, index) => ({
    id: commit.sha,
    label: commit.message.slice(0, 50),
    y: index * 60 + 40,
    x: (positionMap.get(commit.sha) ?? 0) * 160 + 60,
    author: commit.author,
    date: new Date(commit.date).toLocaleString(),
    branches: commit.branches,
    color: color(commit.primaryBranch),
  }));

  // --- ENLACES ---
  const links = commits.flatMap((commit) =>
    commit.parents.map((parentSha) => ({
      source: parentSha,
      target: commit.sha,
    }))
  );

  // --- DIBUJAR LÍNEAS ---
  svg
    .selectAll("line.link")
    .data(links)
    .enter()
    .append("line")
    .attr("x1", (d) => nodes.find((n) => n.id === d.source)?.x || 0)
    .attr("y1", (d) => nodes.find((n) => n.id === d.source)?.y || 0)
    .attr("x2", (d) => nodes.find((n) => n.id === d.target)?.x || 0)
    .attr("y2", (d) => nodes.find((n) => n.id === d.target)?.y || 0)
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 2")
    .attr("opacity", 0.6);

  // --- DIBUJAR CÍRCULOS ---
  const commitsGroup = svg
    .selectAll("g.commit")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  commitsGroup
    .append("circle")
    .attr("r", 8)
    .attr("fill", (d) => d.color)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  // Tooltip básico con .title()
  commitsGroup
    .append("title")
    .text(
      (d) =>
        `${d.label}\nAutor: ${d.author}\nFecha: ${d.date}\nRamas: ${d.branches.join(", ")}`
    );

  // Etiqueta de mensaje al lado del commit
  commitsGroup
    .append("text")
    .attr("x", 12)
    .attr("y", 4)
    .text((d) => d.label)
    .style("font", "12px sans-serif")
    .style("fill", "#333");

  // Etiquetas de ramas junto al commit
  commitsGroup
    .append("text")
    .attr("x", 12)
    .attr("y", -10)
    .text((d) => d.branches.join(", "))
    .style("font", "10px monospace")
    .style("fill", "#555");

  // Etiquetas globales arriba para identificar columnas (opcional)
  const uniqueX = [...new Set(nodes.map((n) => n.x))];
  uniqueX.forEach((x, i) => {
    svg
      .append("text")
      .attr("x", x - 20)
      .attr("y", 15)
      .text(`Flujo ${i + 1}`)
      .style("font", "bold 13px sans-serif")
      .style("fill", "#888");
  });
}
