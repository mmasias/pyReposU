import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const features = [
    {
      title: 'Visualizador Evolutivo de Código',
      description: 'Explora cómo tu código y carpetas evolucionaron a lo largo del tiempo.',
      link: '/visualizador',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-12 h-12 text-blue-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      title: 'Mapa de Contribuciones',
      description: 'Analiza quiénes contribuyeron y cómo a tu proyecto.',
      link: '/mapa-contribuciones',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-12 h-12 text-green-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      ),
    },
    {
      title: 'Análisis Multidimensional',
      description: 'Obtén estadísticas avanzadas sobre la calidad y estructura del código.',
      link: '/analisis-multidimensional',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-12 h-12 text-purple-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3.75l7.5 15h-15l7.5-15z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Framework de Análisis</h1>
        <p className="text-lg text-gray-600 mt-2">
          Elige una de nuestras herramientas para empezar.
        </p>
      </header>

      {/* Features */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center transform transition hover:scale-105"
          >
            {/* Icon */}
            <div className="mb-4">{feature.icon}</div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-4">{feature.description}</p>

            {/* Button */}
            <Link
              to={feature.link}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-md shadow hover:from-blue-600 hover:to-blue-800"
            >
              Explorar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
