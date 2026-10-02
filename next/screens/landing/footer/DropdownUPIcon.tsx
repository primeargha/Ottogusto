import React from "react";

interface DropdownIconProps {
  className?: string;
}

export const DropdownIconUp: React.FC<DropdownIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="currentColor"
      className={className}
      style={{ transform: "rotate(180deg)" }}
    >
      <path d="M1.175 0L5 3.81667L8.825 0L10 1.175L5 6.175L0 1.175L1.175 0Z" />
    </svg>
  );
};
