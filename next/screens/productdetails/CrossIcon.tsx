import React from "react";

interface CrossIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

const CrossIcon: React.FC<CrossIconProps> = ({
  className = "",
  width = 24,
  height = 24,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
        fill="#9C9886"
      />
    </svg>
  );
};

export default CrossIcon;
