import React, { useEffect, useState } from "react";
import axios from "axios";
import { ERROR_MESSAGES, CONSOLE_LOG_MESSAGES } from "../../utils/constants/errorConstants";


interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

interface Props {
  repoUrl: string;
  filePath: string;
  onCommitClick?: (commitHash: string) => void;
}

const CommitTimeline: React.FC<Props> = ({ repoUrl, filePath, onCommitClick }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommits = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/visualizadorCodigo`, {
          params: { repoUrl },
        });

        const filtered = res.data.filter((commit: any) =>
          commit.files.includes(filePath)
        );

        setCommits(filtered);
      } catch (err) {
        console.error(CONSOLE_LOG_MESSAGES.FETCHING_COMMIT_TIMELINE, err);
        setError(ERROR_MESSAGES.FETCHING_COMMIT_TIMELINE);
      } finally {
        setLoading(false);
      }
    };

    if (repoUrl && filePath) {
      loadCommits();
    }
  }, [repoUrl, filePath]);

  if (loading) return <p className="text-gray-500">Cargando timeline de commits...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (commits.length === 0) return <p className="text-gray-400">No hay commits para este archivo.</p>;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Historial de commits del archivo</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Commit</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Autor</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {commits.map((c) => (
              <tr key={c.hash} className="border-b hover:bg-gray-50 cursor-pointer">
                <td
                  onClick={() => onCommitClick?.(c.hash)}
                  className="px-4 py-2 font-mono text-blue-600 hover:underline"
                >
                  {c.hash.slice(0, 7)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">{c.author}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(c.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{c.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommitTimeline;
