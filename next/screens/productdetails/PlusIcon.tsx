import React from "react";

interface IconProps {
  className?: string;
}

export const PlusIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      className={className}
    >
      <path
        d="M12.6667 8.66634H8.66671V12.6663H7.33337V8.66634H3.33337V7.33301H7.33337V3.33301H8.66671V7.33301H12.6667V8.66634Z"
        fill="currentColor"
      />
    </svg>
  );
};
