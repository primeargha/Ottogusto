import React from "react";

export default function VectorDropdown({
  height = 6,
  width = 12,
  color = "#0A4932",
}: {
  height?: number;
  width?: number;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 8"
      fill="none"
    >
      <path
        d="M13 1.00005C13 1.00005 8.5811 7 7 7C5.4188 7 1 1 1 1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
