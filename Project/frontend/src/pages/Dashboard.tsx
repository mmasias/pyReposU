import { Link } from "react-router-dom";

const features = [
  {
    title: "Visualizador de archivos",
    description: "Explora cómo tu repositorio paraluego seleccionar un archivo y pasar al visualizador de código",
    link: "/visualizador",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    title: "Mapa de Contribuciones",
    description: "Analiza quiénes contribuyeron y cuánto a tu proyecto con un mapa de calor.",
    link: "/mapa-heatmap",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  {
    title: "Evolución del commits",
    description: "Observa cuántos commits se han elaborado a lo largo del tiempo y su tamaño y autores.",
    link: "/mapa-bubblechart",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    title: "Análisis Multidimensional",
    description: "Obtén estadísticas avanzadas sobre la calidad y estructura del código.",
    link: "/analisis-multidimensional",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 15h-15l7.5-15z" />
      </svg>
    ),
  },
  {
    title: "Visualizador de Ramas y Commits",
    description: "Explora las ramas y commits de tu repositorio con una vista interactiva.",
    link: "/visualizador-ramas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4m0 0h4M5 7l4-4m5 16v-4m0 4h4m-4 0l4 4M5 17v4m0-4h4m-4 0l4-4" />
      </svg>
    ),
  },
];

const Dashboard = () => {
  return (
    <main className="flex flex-col flex-1 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="py-10 px-4">
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
          Selecciona una herramienta para comenzar.
        </p>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 flex flex-col items-center text-center transition hover:scale-105"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              <Link
                to={feature.link}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
              >
                Explorar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
