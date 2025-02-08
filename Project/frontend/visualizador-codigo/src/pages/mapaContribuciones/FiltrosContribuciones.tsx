import React, { useState, useEffect } from "react";
import axios from "axios";

interface FiltrosContribucionesProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  branch: string;
  setBranch: (branch: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  fetchData: () => void; //     Añadido para evitar error
}

const FiltrosContribuciones: React.FC<FiltrosContribucionesProps> = ({
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  fetchData, //     Recibimos fetchData correctamente
}) => {
  const [branches, setBranches] = useState<string[]>(["main"]);
  const [users, setUsers] = useState<string[]>([]);
  const [repoCreatedAt, setRepoCreatedAt] = useState(""); //     Guardamos la fecha de creación

  useEffect(() => {
    if (!repoUrl) return;

    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/stats/user/branches", {
          params: { repoUrl },
        });
        setBranches(["Todas", ...response.data]);
      } catch (error) {
        console.error("Error al obtener ramas:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/stats/contributions", {
          params: { repoUrl },
        });
        setUsers(Object.keys(response.data));
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    //     Obtener la fecha de creación del repositorio
    const [repoOwner, repoNameRaw] = new URL(repoUrl).pathname.slice(1).split("/");
    const repoName = repoNameRaw.replace(/\.git$/, "");

    axios
      .get(`https://api.github.com/repos/${repoOwner}/${repoName}`)
      .then((response) => {
        const createdAt = response.data.created_at.split("T")[0];
        setRepoCreatedAt(createdAt);
        setStartDate(createdAt); //     Asignamos la fecha desde
      })
      .catch((error) => console.error("Error al obtener la fecha de creación:", error));

    fetchBranches();
    fetchUsers();
  }, [repoUrl, setStartDate]); //     Dependencias corregidas

  //     Validar fechas antes de ejecutar la consulta
  const handleFetchData = () => {
    if (new Date(startDate) < new Date(repoCreatedAt)) {
      alert("    No puedes seleccionar una fecha anterior a la creación del repositorio.");
      return;
    }
    fetchData();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">🔍 Filtros</h3>

      {/* Input de Repositorio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repositorio:</label>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/usuario/repo.git"
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Select de Ramas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rama:</label>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        >
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Select de Usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario:</label>
        <select className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">
          <option value="">Todos</option>
          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      {/* Input de Fecha Inicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desde:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={repoCreatedAt} //     No permite fechas anteriores a la creación del repo
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Input de Fecha Fin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hasta:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Botón para Aplicar Filtros */}
      <button
        onClick={handleFetchData}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default FiltrosContribuciones;
