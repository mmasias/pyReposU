import React from "react";

interface MiniGraphProps {
  current: string;
  parents: string[];
  color: string;
}

export const MiniGraph: React.FC<MiniGraphProps> = ({ color }) => {
  return (
    <svg width="70" height="30">
      <circle cx="35" cy="15" r="6" fill={color} stroke="#000" strokeWidth={1} />
      <line x1="35" y1="0" x2="35" y2="15" stroke="#aaa" strokeWidth={2} strokeDasharray="3 2" />
    </svg>
  );
};
