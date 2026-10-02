import React from "react";

interface DownArrowFilterIconProps {
  className?: string;
}

const DownArrowFilterIcon: React.FC<DownArrowFilterIconProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      <path
        d="M6.175 6.9126L10 10.7293L13.825 6.9126L15 8.0876L10 13.0876L5 8.0876L6.175 6.9126Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default DownArrowFilterIcon;
