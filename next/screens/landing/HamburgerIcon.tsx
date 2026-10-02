import React from "react";

interface HamburgerMenuIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const HamburgerMenuIcon: React.FC<HamburgerMenuIconProps> = ({
  className,
  width = 18,
  height = 12,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 12"
      fill="none"
      width={width}
      height={height}
      className={className}
      {...props}
    >
      <path d="M0 12H18V10H0V12ZM0 7H18V5H0V7ZM0 0V2H18V0H0Z" fill="currentColor" />
    </svg>
  );
};

export default HamburgerMenuIcon;
