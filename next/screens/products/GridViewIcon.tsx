import React from "react";

interface GridViewIconProps {
  className?: string;
}

const GridViewIcon: React.FC<GridViewIconProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 18 18"
      width="16"
      height="16"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      <path
        d="M0 0V8H8V0H0ZM6 6H2V2H6V6ZM0 10V18H8V10H0ZM6 16H2V12H6V16ZM10 0V8H18V0H10ZM16 6H12V2H16V6ZM10 10V18H18V10H10ZM16 16H12V12H16V16Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default GridViewIcon;
