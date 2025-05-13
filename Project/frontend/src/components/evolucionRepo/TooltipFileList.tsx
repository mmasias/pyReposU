import React, { useEffect, useRef, useState } from "react";

interface Props {
  filePaths: string[];
}

const TooltipFileList: React.FC<Props> = ({ filePaths }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [openUpward, setOpenUpward] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const bottomSpace = window.innerHeight - rect.top;
    setOpenUpward(bottomSpace < 180);
  }, []);

  return (
        <div
        ref={ref}
        className={`absolute z-10 bg-white dark:bg-gray-800 border rounded shadow p-2 text-xs ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
        } left-0 group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-max max-w-xs max-h-40 overflow-y-auto pointer-events-none group-hover:pointer-events-auto`}
        style={{ minHeight: '0px' }} 
        >

      <ul className="list-disc pl-4 text-gray-800 dark:text-gray-200">
        <li className="list-none font-semibold text-green-600">Archivos modificados</li>
        {filePaths.map((file, i) => (
          <li key={i}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default TooltipFileList;
