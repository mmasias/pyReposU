import React from "react";

interface TooltipProps {
  x: number;
  y: number;
  content: string;
}

const HeatmapTooltip: React.FC<TooltipProps> = ({ x, y, content }) => {
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    zIndex: 1000,
    left: x + 15, //     Mueve el tooltip un poco a la derecha
    top: y + 15,  //     Mueve el tooltip un poco abajo
    maxWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return <div style={tooltipStyle}>{content}</div>;
};

export default HeatmapTooltip;
