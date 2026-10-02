import React from "react";

type VinNotFitIconProps = {
  className?: string;
};

const VinNotFitIcon: React.FC<VinNotFitIconProps> = ({ className }) => {
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
      <path
        d="M6.55 3.12L5.1 1.66C6.68 0.61 8.57 0 10.61 0C16.13 0 20.61 4.48 20.61 10C20.61 12.04 20 13.93 18.95 15.51L17.49 14.05C18.2 12.86 18.61 11.48 18.61 10C18.61 5.59 15.02 2 10.61 2C9.13 2 7.75 2.41 6.55 3.12ZM16.27 7.53L14.86 6.12L12.21 8.77L13.62 10.18L16.27 7.53ZM18.39 20.61L16.12 18.34C14.54 19.39 12.65 20 10.61 20C5.09 20 0.61 15.52 0.61 10C0.61 7.96 1.22 6.07 2.27 4.49L0 2.22L1.41 0.81L19.79 19.19L18.39 20.61ZM14.67 16.88L10.79 13L9.2 14.59L4.96 10.35L6.37 8.94L9.2 11.77L9.38 11.59L3.73 5.94C3.02 7.14 2.61 8.52 2.61 10C2.61 14.41 6.2 18 10.61 18C12.09 18 13.47 17.59 14.67 16.88Z"
        fill="#C20000"
      />
    </svg>
  );
};

export default VinNotFitIcon;
