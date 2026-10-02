import React from "react";

type VinWarningIconProps = {
  className?: string;
};

const VinWarningIcon: React.FC<VinWarningIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="24"
      height="24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="3" />
      <rect x="14.5" y="7" width="3" height="11" fill="currentColor" />
      <rect x="14.5" y="20" width="3" height="3" fill="currentColor" />
    </svg>
  );
};

export default VinWarningIcon;
