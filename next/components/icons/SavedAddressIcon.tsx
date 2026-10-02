import React from "react";

export default function SavedAddressIcon({
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
        d="M12.0834 7.49996C12.0834 8.65054 11.1506 9.58329 10 9.58329C8.84944 9.58329 7.91669 8.65054 7.91669 7.49996C7.91669 6.34937 8.84944 5.41663 10 5.41663C11.1506 5.41663 12.0834 6.34937 12.0834 7.49996Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M11.0479 14.578C10.7668 14.8486 10.3911 15 10.0002 15C9.60919 15 9.23352 14.8486 8.95244 14.578C6.3786 12.084 2.92935 9.29788 4.61145 5.25307C5.52094 3.06606 7.70414 1.66663 10.0002 1.66663C12.2962 1.66663 14.4794 3.06607 15.3889 5.25307C17.0689 9.29279 13.628 12.0925 11.0479 14.578Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 16.6666C15 17.5871 12.7614 18.3333 10 18.3333C7.23857 18.3333 5 17.5871 5 16.6666"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
