import React from "react";

interface UserData {
  user: string;
  totalContributions: number;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number;
  issues: number;
  comments: number;
  selectedBranch: string;
}

interface TablaAnalisisProps {
  data: UserData[];
  branches: string[];
  visibleColumns: string[];
  setData: React.Dispatch<React.SetStateAction<UserData[]>>;
  statsMap: Record<string, Record<string, UserData>>;
}

const TablaAnalisis: React.FC<TablaAnalisisProps> = ({ data, branches, visibleColumns, setData, statsMap }) => {
  const updateBranchData = (user: string, branch: string) => {
    const userBranches = statsMap[user];
    if (!userBranches) return;

    const newStats = userBranches[branch] || userBranches["Todas"] || Object.values(userBranches)[0];
    if (!newStats) return;

    setData(prev =>
      prev.map(u =>
        u.user === user ? { ...newStats, selectedBranch: branch } : u
      )
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Rama</th>
            {visibleColumns.map(col => (
              <th key={col} className="border p-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((userData: UserData) => (
            <tr key={userData.user} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="border p-2">{userData.user}</td>
              <td className="border p-2">
                <select
                  value={userData.selectedBranch}
                  onChange={(e) => updateBranchData(userData.user, e.target.value)}
                  className="border rounded p-1 bg-white dark:bg-gray-700"
                >
                  {branches.map((branch, index) => (
                    <option key={`${branch}-${index}`} value={branch}>{branch}</option>
                  ))}
                </select>
              </td>
              {visibleColumns.map(col => (
                <td key={col} className="border p-2">{userData[col as keyof UserData]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAnalisis;
