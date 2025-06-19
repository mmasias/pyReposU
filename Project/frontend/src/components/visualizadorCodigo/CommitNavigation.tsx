import React from "react";

interface CommitNavigationProps {
  currentIndex: number;
  totalCommits: number;
  lastCommitHash?: string;
  onPrevious: () => void;
  onNext: () => void;
  onGoToFirst: () => void;
  onGoToLast: () => void;
}

const CommitNavigation: React.FC<CommitNavigationProps> = ({
  currentIndex,
  totalCommits,
  lastCommitHash,
  onPrevious,
  onNext,
  onGoToFirst,
  onGoToLast,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = totalCommits > 0 && currentIndex === totalCommits - 1;
  const hasCommits = totalCommits > 0;

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <button
        onClick={onGoToFirst}
        disabled={isFirst}
        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
      >
        Primer commit
      </button>

      <button
        onClick={onPrevious}
        disabled={isFirst}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
      >
        Anterior
      </button>

      <button
        onClick={onNext}
        disabled={isLast}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
      >
        Siguiente
      </button>

      <button
        onClick={onGoToLast}
        disabled={!hasCommits || isLast}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
      >
        Último commit
      </button>
    </div>
  );
};

export default CommitNavigation;
