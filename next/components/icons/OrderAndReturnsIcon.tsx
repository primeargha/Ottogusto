import React from "react";

export default function OrderAndReturnsIcon({
  height = 20,
  width = 20,
  className,
  color = "currentColor",
}: {
  height?: number;
  width?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M10 18.3334C9.31817 18.3334 8.66683 18.0582 7.36411 17.508C4.12137 16.1381 2.5 15.4532 2.5 14.3011C2.5 13.9785 2.5 8.38712 2.5 5.83337M10 18.3334C10.6818 18.3334 11.3332 18.0582 12.6359 17.508C15.8787 16.1381 17.5 15.4532 17.5 14.3011V5.83337M10 18.3334V9.46237"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.93827 8.07611L4.50393 6.89817C3.16797 6.25171 2.5 5.92848 2.5 5.41663C2.5 4.90477 3.16797 4.58154 4.50393 3.93508L6.93827 2.75714C8.44067 2.03013 9.19192 1.66663 10 1.66663C10.8081 1.66663 11.5593 2.03013 13.0617 2.75714L15.4961 3.93508C16.832 4.58154 17.5 4.90477 17.5 5.41663C17.5 5.92848 16.832 6.25171 15.4961 6.89817L13.0617 8.07611C11.5593 8.80313 10.8081 9.16663 10 9.16663C9.19192 9.16663 8.44067 8.80313 6.93827 8.07611Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 10L6.66667 10.8333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14.1666 3.33337L5.83331 7.50004"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
