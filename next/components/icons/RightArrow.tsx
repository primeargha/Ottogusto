import React from "react";

export default function RightArrow({
  height = 14,
  width = 8,
  color = "--brand-piston-green",
  className,
}: {
  height?: number;
  width?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 8 14"
      fill="none"
      className={className}
    >
      <path
        d="M1.00005 1C1.00005 1 7 5.4189 7 7C7 8.5812 1 13 1 13"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
