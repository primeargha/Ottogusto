import React from "react";

interface IconProps {
  className?: string;
}

export const MinusIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10 2"
      width={12}
      height={12}
      fill="currentColor"
      className={className}
    >
      <path d="M9.33333 1.33333H0V0H9.33333V1.33333Z" fill="currentColor" />
    </svg>
  );
};
