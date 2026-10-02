import React from "react";

export default function BackIcon({
  height = 20,
  width = 13,
  color = "--brand-piston-green",
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
      viewBox="0 0 20 14"
      fill="none"
    >
      <path
        d="M20 6.22742H2.56031L6.57268 1.5925L5.62692 0.5L0 7L5.62692 13.5L6.57268 12.4075L2.56023 7.77248H20V6.22742Z"
        fill={color}
      />
    </svg>
  );
}
