import React from "react";

const LeftGreenArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "text-[#4E9770]",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default LeftGreenArrowIcon;
