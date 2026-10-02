import React from "react";

interface SelectedTickProps {
  className?: string;
}

const SelectedTick: React.FC<SelectedTickProps> = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={24}
      width={24}
      fill="none"
      className={className}
    >
      <path
        d="M8.79508 15.8749L4.62508 11.7049L3.20508 13.1149L8.79508 18.7049L20.7951 6.70492L19.3851 5.29492L8.79508 15.8749Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SelectedTick;
