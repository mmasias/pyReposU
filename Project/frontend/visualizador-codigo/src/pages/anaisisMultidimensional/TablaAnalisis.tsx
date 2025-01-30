import React from "react";
import axios from "axios";

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
}

const TablaAnalisis: React.FC<TablaAnalisisProps> = ({ data, branches, visibleColumns, setData }) => {
  
  const updateBranchData = async (user: string, branch: string) => {
    try {
      const response = await axios.get<UserData[]>("http://localhost:3000/api/stats/user", {
        params: { 
          repoUrl: "https://github.com/mmasias/pyReposU.git", 
          branch: branch === "Todas" ? undefined : branch,  //   Si es "Todas", no mandamos `branch`
          startDate: "2024-01-01", 
          endDate: "2025-01-29" 
        }
      });
  
      const updatedUserStats = response.data.find((u: UserData) => u.user === user);
      if (updatedUserStats) {
        setData((prevData: UserData[]) =>
          prevData.map((u: UserData) => u.user === user ? { ...u, ...updatedUserStats, selectedBranch: branch } : u)
        );
      }
    } catch (error) {
      console.error("Error al actualizar datos de la rama:", error);
    }
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Usuario</th>
          <th className="border p-2">Rama</th>
          {visibleColumns.map(col => (
            <th key={col} className="border p-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((userData: UserData) => (
          <tr key={userData.user}>
            <td className="border p-2">{userData.user}</td>
            <td className="border p-2">
              <select
                value={userData.selectedBranch}
                onChange={(e) => updateBranchData(userData.user, e.target.value)}
                className="border rounded p-1"
              >
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
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
  );
};

export default TablaAnalisis;
