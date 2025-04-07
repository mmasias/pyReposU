import React, { useEffect, useState } from "react";
import CommitGraphSVG from "./CommitGraphSVG";
import "../styles/ResizableStyles.css";
import * as d3 from "d3"; 

type Commit = {
  sha: string;
  message: string;
  parents: string[];
  branches: string[];
  primaryBranch: string;
  date: string;
  author: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
};

interface CommitGraphProps {
  repoUrl: string;
}

const CommitGraph: React.FC<CommitGraphProps> = ({ repoUrl }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/graph?url=${encodeURIComponent(repoUrl)}`);
      const data = await res.json();

      const sorted = data.sort(
        (a: Commit, b: Commit) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setCommits(sorted);
    };

    fetchData();
  }, [repoUrl]);

  const commitIndexMap = Object.fromEntries(commits.map((c, i) => [c.sha, i]));

  const branchColumnMap = new Map<string, number>();
  let col = 0;
  commits.forEach((c) => {
    const branch = c.primaryBranch || "main";
    if (!branchColumnMap.has(branch)) {
      branchColumnMap.set(branch, col++);
    }
  });

  //  Mapa de colores únicos por rama
  const branchColorScale = d3.scaleOrdinal(d3.schemeTableau10);
  const allBranches = Array.from(branchColumnMap.keys());
  const branchColorMap = Object.fromEntries(
    allBranches.map((branch, i) => [branch, branchColorScale(i)])
  );

  return (
    <div className="overflow-auto font-mono text-sm">
      <div className="grid grid-cols-[160px_80px_1fr_150px_180px_100px_160px] gap-2 border-b p-2 font-bold bg-gray-100">
        <div>Branch</div>
        <div>Graph</div>
        <div>Message</div>
        <div>Author</div>
        <div>Date</div>
        <div>SHA</div>
        <div>Changes</div>
      </div>

      <div className="relative" style={{ height: `${commits.length * 40}px` }}>
        <CommitGraphSVG
          commits={commits}
          commitIndexMap={commitIndexMap}
          branchColumnMap={branchColumnMap}
          branchColorMap={branchColorMap} 
        />

        <div className="absolute left-0 top-0 w-full">
          {commits.map((commit, index) => {
            const branch = commit.primaryBranch || "main";
            const showBranch =
              index === 0 || branch !== (commits[index - 1]?.primaryBranch || "main");

            return (
              <div
                key={commit.sha}
                className="grid grid-cols-[160px_80px_1fr_150px_180px_100px_160px] gap-2 items-center px-2 py-1 border-b hover:bg-gray-50"
                style={{ height: 40 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Branch */}
                <div
                  className="font-semibold whitespace-nowrap"
                  style={{ color: branchColorMap[branch] }}
                >
                  {showBranch ? branch : hoveredIndex === index ? (
                    <span className="opacity-60">{branch}</span>
                  ) : ""}
                </div>

                {/* Graph placeholder */}
                <div></div>

                {/* Message */}
                <div className="truncate" title={commit.message}>
                  {commit.message}
                </div>

                {/* Author */}
                <div>{commit.author}</div>

                {/* Date */}
                <div>{new Date(commit.date).toLocaleString()}</div>

                {/* SHA */}
                <div className="text-xs text-gray-500">{commit.sha.slice(0, 7)}</div>

                {/* Changes */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span title="Archivos modificados">🗂️</span>
                    <span className="text-blue-600 font-medium">{commit.filesChanged}</span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{
                        width: `${calcPercentage(commit.insertions, commit.insertions + commit.deletions)}%`
                      }}
                      title={`+${commit.insertions} insertions`}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-red-500"
                      style={{
                        width: `${calcPercentage(commit.deletions, commit.insertions + commit.deletions)}%`
                      }}
                      title={`-${commit.deletions} deletions`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function calcPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

export default CommitGraph;
