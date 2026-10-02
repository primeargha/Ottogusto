import React from "react";

type VinCheckCircleIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

/** Tick mark inside a circular fill — used for verified VIN in the car banner. */
const VinCheckCircleIcon: React.FC<VinCheckCircleIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M7.99992 1.33325C4.31992 1.33325 1.33325 4.31992 1.33325 7.99992C1.33325 11.6799 4.31992 14.6666 7.99992 14.6666C11.6799 14.6666 14.6666 11.6799 14.6666 7.99992C14.6666 4.31992 11.6799 1.33325 7.99992 1.33325ZM6.66658 11.3333L3.33325 7.99992L4.27325 7.05992L6.66658 9.44658L11.7266 4.38658L12.6666 5.33325L6.66658 11.3333Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default VinCheckCircleIcon;
