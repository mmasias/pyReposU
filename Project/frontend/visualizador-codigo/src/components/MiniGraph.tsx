import React from "react";

type MiniGraphProps = {
  sha: string;
  parents: string[];
  index: number;
  commitIndexMap: Record<string, number>; 
  branchColumnMap: Map<string, number>;   
  primaryBranch: string;
  commits: {
    sha: string;
    primaryBranch: string;
  }[];
};

export const MiniGraph: React.FC<MiniGraphProps> = ({
  sha,
  parents,
  index,
  commitIndexMap,
  branchColumnMap,
  primaryBranch,
  commits,
}) => {
  const cellHeight = 40;
  const radius = 5;
  const svgWidth = 80;
  const svgHeight = cellHeight;

  const colWidth = 20;
  const currentCol = branchColumnMap.get(primaryBranch) ?? 0;
  const x = currentCol * colWidth + 10;
  const y = svgHeight / 2;

  return (
    <svg width={svgWidth} height={svgHeight}>
      {/* Líneas hacia los padres (merge o continuidad) */}
      {parents.map((parentSha, i) => {
        const parentIndex = commitIndexMap[parentSha];
        if (parentIndex === undefined) return null;

        const parentCommit = commits[parentIndex];
        if (!parentCommit) return null;

        const parentCol = branchColumnMap.get(parentCommit.primaryBranch) ?? 0;
        const parentX = parentCol * colWidth + 10;
        const parentY = (parentIndex - index) * cellHeight + svgHeight / 2;

        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={parentX}
            y2={parentY}
            stroke="#999"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Nodo actual */}
      <circle cx={x} cy={y} r={radius} fill="#0ea5e9" stroke="#000" strokeWidth={1} />
    </svg>
  );
};
