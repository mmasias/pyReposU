import React from "react";

interface CommitInfoProps {
  commit: {
    hash: string;
    author: string;
    date: string;
    message: string;
  };
}

const CommitInfo: React.FC<CommitInfoProps> = ({ commit }) => {
  if (!commit) return null;

  return (
    <div className="mb-6 bg-white p-4 rounded shadow text-sm text-gray-700 border border-gray-200">
      <p>
        <strong className="text-gray-600">Commit actual:</strong>{" "}
        <span className="font-mono text-blue-700">{commit.hash}</span>
      </p>
      <p>
        <strong className="text-gray-600">Autor:</strong> {commit.author}
      </p>
      <p>
        <strong className="text-gray-600">Fecha:</strong>{" "}
        {new Date(commit.date).toLocaleString()}
      </p>
      <p>
        <strong className="text-gray-600">Mensaje:</strong>{" "}
        <span className="text-gray-800">{commit.message}</span>
      </p>
    </div>
  );
};

export default CommitInfo;
