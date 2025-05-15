import { useEffect, useRef } from "react";

interface DiffViewerProps {
  leftTitle?: string;
  rightTitle?: string;
  leftLines: string[];
  rightLines: string[];
  addedLines: string[];
  removedLines: string[];
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  leftTitle = "Versión Anterior",
  rightTitle = "Versión Actual",
  leftLines,
  rightLines,
  addedLines,
  removedLines,
}) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const source = e.target as HTMLElement;
      const target = source === leftRef.current ? rightRef.current : leftRef.current;
      if (target) target.scrollTop = source.scrollTop;
    };

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;

    leftEl?.addEventListener("scroll", handleScroll);
    rightEl?.addEventListener("scroll", handleScroll);

    return () => {
      leftEl?.removeEventListener("scroll", handleScroll);
      rightEl?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lógica simple de alineamiento (tipo diff)
  const alignLines = () => {
    const alignedLeft: string[] = [];
    const alignedRight: string[] = [];

    let i = 0;
    let j = 0;

    while (i < leftLines.length || j < rightLines.length) {
      const left = leftLines[i];
      const right = rightLines[j];

      if (left === right) {
        alignedLeft.push(left);
        alignedRight.push(right);
        i++;
        j++;
      } else if (right && addedLines.includes(right)) {
        alignedLeft.push(""); // línea fantasma
        alignedRight.push(right);
        j++;
      } else if (left && removedLines.includes(left)) {
        alignedLeft.push(left);
        alignedRight.push(""); // línea fantasma
        i++;
      } else {
        // fallback por si el diff no detectó
        alignedLeft.push(left ?? "");
        alignedRight.push(right ?? "");
        i++;
        j++;
      }
    }

    return { alignedLeft, alignedRight };
  };

  const { alignedLeft, alignedRight } = alignLines();

  const renderLine = (
    content: string,
    index: number,
    isHighlighted: boolean,
    isGhost: boolean,
    side: "left" | "right"
  ) => {
    const bgColor = isHighlighted
      ? side === "left"
        ? "bg-red-100"
        : "bg-green-100"
      : isGhost
      ? "bg-gray-50 border border-dashed border-gray-300"
      : "";

    return (
      <div
        key={index}
        className={`flex px-2 py-1 text-sm font-mono items-start ${bgColor}`}
        style={{ minHeight: "1.5em" }}
      >
        <span className="w-10 text-right pr-2 text-gray-500 select-none">{!isGhost ? index + 1 : ""}</span>
        <pre className="whitespace-pre-wrap break-words w-full opacity-90">
          {content || <>&nbsp;</>}
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full grid grid-cols-2 gap-4 mt-6">
      {/* Lado izquierdo */}
      <div className="bg-white border rounded-md shadow">
        <div className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-t-md">{leftTitle}</div>

        {/* 🔔 Mensaje de "sin cambios" */}
        {addedLines.length === 0 && removedLines.length === 0 && leftLines.length > 0 && (
          <div className="text-center text-sm text-gray-500 italic my-3">
            Este commit no introdujo cambios en el archivo.
          </div>
        )}

        <div ref={leftRef} className="max-h-[600px] overflow-y-scroll border-t text-sm">
          {alignedLeft.map((line, i) =>
            renderLine(
              line,
              i,
              removedLines.includes(line),
              alignedRight[i] === "",
              "left"
            )
          )}
        </div>
      </div>

      {/* Lado derecho */}
      <div className="bg-white border rounded-md shadow">
        <div className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-t-md">{rightTitle}</div>

        {/* 🔔 Mensaje también aquí, para coherencia visual */}
        {addedLines.length === 0 && removedLines.length === 0 && leftLines.length > 0 && (
          <div className="text-center text-sm text-gray-500 italic my-3">
            Este commit no introdujo cambios en el archivo.
          </div>
        )}
        <div ref={rightRef} className="max-h-[600px] overflow-y-scroll border-t text-sm">
          {alignedRight.map((line, i) =>
            renderLine(
              line,
              i,
              addedLines.includes(line),
              alignedLeft[i] === "",
              "right"
            )
          )}
        </div>
      </div>
    </div>
  );

};

export default DiffViewer;
