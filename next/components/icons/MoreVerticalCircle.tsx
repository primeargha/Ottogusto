import React from "react";

export default function MoreVerticalCircle({
  height = 24,
  width = 24,
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
      viewBox="0 0 25 24"
      fill="none"
    >
      <path
        d="M12.2773 12H12.2863"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2656 16H12.2746"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2812 8H12.2902"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.2812 12C22.2812 6.47715 17.804 2 12.2812 2C6.7584 2 2.28125 6.47715 2.28125 12C2.28125 17.5228 6.7584 22 12.2812 22C17.804 22 22.2812 17.5228 22.2812 12Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}
