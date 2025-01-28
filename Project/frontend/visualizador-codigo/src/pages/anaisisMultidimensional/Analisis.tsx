import React, { useState } from "react";
import axios from "axios";
import TablaAnalisis from "./TablaAnalisis";
import Filtros from "./Filtros";
import SubpanelDetalles from "./SubpanelDetalles";
import ExportarDatos from "./ExportarDatos";

const Analisis = () => {
  const [data, setData] = useState<any[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string | null>(null);

  const fetchData = async () => {
    const response = await axios.get(`http://localhost:3000/api/stats/user`, { params: { repoUrl, branch, startDate: since, endDate: until } });
    setData(response.data);
  };

  return (
    <div className="p-6">
      <Filtros {...{ repoUrl, setRepoUrl, branch, setBranch, since, setSince, until, setUntil, fetchData }} />
      <TablaAnalisis data={data} onRowClick={setUsuarioSeleccionado} />
      <ExportarDatos />
      <SubpanelDetalles usuario={usuarioSeleccionado} cerrarPanel={() => setUsuarioSeleccionado(null)} />
    </div>
  );
};

export default Analisis;
