import React from "react";

type Commit = {
  sha: string;
  parents: string[];
  primaryBranch: string;
};

interface Props {
  commits: Commit[];
  commitIndexMap: Record<string, number>;
  branchColumnMap: Map<string, number>;
  branchColorMap: Record<string, string>; 
}

const CommitGraphSVG: React.FC<Props> = ({
  commits,
  commitIndexMap,
  branchColumnMap,
  branchColorMap,
}) => {
  console.log("🖼️ SVG render con commits:", commits.length);

  const cellHeight = 40;
  const colWidth = 20;
  const radius = 5;

  const svgWidth = branchColumnMap.size * colWidth + 40;
  const svgHeight = commits.length * cellHeight;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      className="absolute left-[160px] top-0 z-0"
      style={{ pointerEvents: "none" }}
    >
      {commits.map((commit, index) => {


        const branch = commit.primaryBranch || "main";
        const color = branchColorMap[branch] || "#999";
        const x = (branchColumnMap.get(branch) ?? 0) * colWidth + 10;
        const y = index * cellHeight + cellHeight / 2;
        console.log(`🔘 Dibujando nodo para commit ${commit.sha} en branch ${branch}`);
        return (
          <g key={commit.sha}>
            
            {/* Líneas hacia los padres */}
            {commit.parents.map((parentSha, i) => {
              const parentIndex = commitIndexMap[parentSha];
              if (typeof parentIndex !== "number") {
  console.warn("Missing parent commit in graph:", parentSha);
  
  return null;
}

              const parent = commits[parentIndex];
              if (!parent) return null;

              const parentBranch = parent.primaryBranch || "main";
              const parentX =
                (branchColumnMap.get(parentBranch) ?? 0) * colWidth + 10;
              const parentY =
                parentIndex * cellHeight + cellHeight / 2;

              return (
                <line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={parentX}
                  y2={parentY}
                  stroke={branchColorMap[parentBranch] || "#999"}
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Nodo actual */}
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={color}
              stroke="#000"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default CommitGraphSVG;
