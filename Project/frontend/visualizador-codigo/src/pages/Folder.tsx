import React, { useState } from 'react';

interface FolderProps {
  folderData: any; // Representa una carpeta o un archivo
  level: number; // Nivel actual de la jerarquía
}

const Folder: React.FC<FolderProps> = ({ folderData, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`mb-4 ${level > 0 ? 'pl-4' : ''}`}>
      {/* Carpeta o archivo */}
      <div
        onClick={toggleExpand}
        className={`cursor-pointer flex justify-between items-center ${
          level === 0 ? 'bg-blue-100' : 'bg-gray-100'
        } p-4 rounded-md shadow-md`}
      >
        <h3 className="text-lg font-semibold text-gray-800">
          {folderData.subfolders ? '📁' : '📄'} {folderData.name}
        </h3>
        <span className="text-gray-600">{folderData.changes || 0} cambios</span>
      </div>

      {/* Mostrar subcarpetas y archivos si está expandido */}
      {isExpanded && folderData.subfolders && (
        <div className="mt-4 border-l-2 border-gray-300">
          {/* Subcarpetas */}
          {folderData.subfolders.map((subfolder: any, index: number) => (
            <Folder key={index} folderData={subfolder} level={level + 1} />
          ))}

          {/* Archivos */}
          {folderData.files?.map((file: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center text-gray-700 mt-2 ml-4"
            >
              <span>📄 {file.name}</span>
              <span className="text-sm">{file.changes || 0} cambios</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
