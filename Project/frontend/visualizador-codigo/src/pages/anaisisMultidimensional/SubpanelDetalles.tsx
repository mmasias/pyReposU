import React from "react";

interface SubpanelDetallesProps {
  usuario: string | null;
  cerrarPanel: () => void;
}

const SubpanelDetalles: React.FC<SubpanelDetallesProps> = ({ usuario, cerrarPanel }) => {
  if (!usuario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold">Detalles de {usuario}</h2>
        <p>🔍 Aquí se mostrarán las estadísticas detalladas del usuario.</p>
        <button onClick={cerrarPanel} className="bg-red-500 text-white p-2 rounded mt-4">Cerrar</button>
      </div>
    </div>
  );
};

export default SubpanelDetalles;
