import { Link, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const location = useLocation();

  // Mapa de títulos según la ruta actual
  const titles: Record<string, string> = {
    "/": "Framework de análisis",
    "/visualizador": "Visualizador Evolutivo de Código",
    "/mapa-heatmap": "Mapa de Contribuciones",
    "/mapa-bubblechart": "Evolución del Código",
    "/analisis-multidimensional": "Análisis Multidimensional",
  };

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/visualizador", label: "Código" },
    { path: "/mapa-heatmap", label: "Contribuciones" },
    { path: "/mapa-bubblechart", label: "Evolución" },
    { path: "/analisis-multidimensional", label: "Análisis" },
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

      <ThemeSwitcher />
    </nav>
  );
};

export default Navbar;
