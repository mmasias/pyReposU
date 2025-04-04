import React, { useEffect, useState } from "react";
import { MiniGraph } from "./MiniGraph";

type Commit = {
  sha: string;
  message: string;
  parents: string[];
  branches: string[];
  primaryBranch: string;
  date: string;
  author: string;
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

  return (
    <div className="overflow-auto font-mono">
      <div className="grid grid-cols-[150px_80px_1fr_150px_180px_100px] gap-2 border-b p-2 font-bold bg-gray-100">
        <div>Branch</div>
        <div>Graph</div>
        <div>Message</div>
        <div>Author</div>
        <div>Date</div>
        <div>SHA</div>
      </div>

      {commits.map((commit, index) => {
        const showBranch =
          index === 0 || commit.primaryBranch !== commits[index - 1].primaryBranch;

        return (
          <div
            key={commit.sha}
            className="grid grid-cols-[150px_80px_1fr_150px_180px_100px] gap-2 items-center px-2 py-1 border-b hover:bg-gray-50"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative text-sm text-blue-600 font-semibold">
              {showBranch ? (
                commit.primaryBranch
              ) : hoveredIndex === index ? (
                <span className="opacity-60">{commit.primaryBranch}</span>
              ) : (
                ""
              )}
            </div>
            <div>
              <MiniGraph
                current={commit.sha}
                parents={commit.parents}
                color={getBranchColor(commit.primaryBranch)}
              />
            </div>
            <div className="truncate">{commit.message}</div>
            <div>{commit.author}</div>
            <div>{new Date(commit.date).toLocaleString()}</div>
            <div className="text-xs text-gray-500">{commit.sha.slice(0, 7)}</div>
          </div>
        );
      })}
    </div>
  );
};

function getBranchColor(branch: string) {
  const colorMap: Record<string, string> = {
    main: "#f97316",
    develop: "#3b82f6",
  };
  return colorMap[branch] || "#10b981"; // tailwind green-500
}

export default CommitGraph;
