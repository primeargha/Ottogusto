import React from "react";

interface InfoCircleIconProps {
  className?: string;
}

export function InfoCircleIcon({ className = "" }: InfoCircleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 22 22"
      fill="none"
      className={className}
    >
      <path d="M11 16.0026V9.33594" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" />
      <path
        d="M11 6.83333V5.16667V6.83333ZM11 1C8.34783 1 5.8043 2.05357 3.92893 3.92893C2.05357 5.8043 1 8.34783 1 11C1 13.6522 2.05357 16.1957 3.92893 18.0711C5.8043 19.9464 8.34783 21 11 21C13.6522 21 16.1957 19.9464 18.0711 18.0711C19.9464 16.1957 21 13.6522 21 11C21 8.34783 19.9464 5.8043 18.0711 3.92893C16.1957 2.05357 13.6522 1 11 1V1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
