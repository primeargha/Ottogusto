import React from "react";

export default function DeleteUserIcon({
  height = 100,
  width = 100,
  className,
  color,
}: {
  height?: number;
  width?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M27.4066 64.5074C21.5117 68.0174 6.05568 75.1845 15.4694 84.1533C20.068 88.5341 25.1896 91.6674 31.6286 91.6674H68.3713C74.8104 91.6674 79.9321 88.5341 84.5304 84.1533C93.9442 75.1845 78.4883 68.0174 72.5933 64.5074C58.77 56.2762 41.23 56.2762 27.4066 64.5074Z"
        stroke={color}
        strokeWidth="6.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68.75 27.084C68.75 37.4393 60.3554 45.834 50 45.834C39.6447 45.834 31.25 37.4393 31.25 27.084C31.25 16.7287 39.6447 8.33398 50 8.33398C60.3554 8.33398 68.75 16.7287 68.75 27.084Z"
        stroke={color}
        strokeWidth="6.25"
      />
    </svg>
  );
}
