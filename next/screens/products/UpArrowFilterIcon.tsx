import React from "react";

interface UpArrowFilterIconProps {
  className?: string;
}

const UpArrowFilterIcon: React.FC<UpArrowFilterIconProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      <path
        d="M7.41 15.7049L12 11.1249L16.59 15.7049L18 14.2949L12 8.29492L6 14.2949L7.41 15.7049Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default UpArrowFilterIcon;
