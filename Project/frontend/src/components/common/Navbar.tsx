import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  // Mapa de títulos según la ruta actual
  const titles: Record<string, string> = {
    "/": "Sistema de auditoría de repositorios de GitHub",
    "/visualizador": "Visualizador Evolutivo de Código",
    "/mapa-heatmap": "Mapa de Contribuciones",
    "/mapa-bubblechart": "Evolución del Código",
    "/analisis-multidimensional": "Análisis Multidimensional",
    "/visualizador-ramas": "Timeline de Commits",
  };

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/visualizador", label: "Código" },
    { path: "/mapa-heatmap", label: "Contribuciones" },
    { path: "/mapa-bubblechart", label: "Evolución" },
    { path: "/analisis-multidimensional", label: "Análisis" },
    { path: "/visualizador-ramas", label: "Timeline commits" },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Título dinámico según la página */}
      <h1 className="text-xl font-bold">
        {titles[location.pathname] || "Framework de análisis"}
      </h1>

      <div className="flex gap-4">
        {links.map(
          (link) =>
            link.path !== location.pathname && (
              <Link
                key={link.path}
                to={link.path}
                className="hover:text-gray-300 transition duration-200"
              >
                {link.label}
              </Link>
            )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
