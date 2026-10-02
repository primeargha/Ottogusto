import React from "react";

export default function DeleteAddressIcon({
  height = 100,
  width = 100,
  className,
  color,
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
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <path
        d="M81.25 22.916L78.6679 64.6873C78.0079 75.3593 77.6783 80.6956 75.0033 84.5323C73.6804 86.4289 71.9779 88.0298 70.0029 89.2327C66.0087 91.666 60.6625 91.666 49.9696 91.666C39.263 91.666 33.9096 91.666 29.9127 89.2281C27.9367 88.0231 26.2333 86.4193 24.9112 84.5193C22.237 80.6768 21.9144 75.3331 21.2692 64.646L18.75 22.916"
        stroke={color}
        strokeWidth="6.25"
        strokeLinecap="round"
      />
      <path d="M37.5 48.8926H62.5" stroke={color} strokeWidth="6.25" strokeLinecap="round" />
      <path d="M43.75 65.2266H56.25" stroke={color} strokeWidth="6.25" strokeLinecap="round" />
      <path
        d="M12.5 22.9173H87.5M66.8979 22.9173L64.0537 17.0495C62.1642 13.1517 61.2192 11.2028 59.5896 9.98736C59.2283 9.71773 58.8454 9.4779 58.445 9.27023C56.6404 8.33398 54.4746 8.33398 50.1429 8.33398C45.7025 8.33398 43.4825 8.33398 41.6479 9.30948C41.2413 9.52569 40.8533 9.77523 40.4879 10.0555C38.8394 11.3202 37.9185 13.3404 36.0767 17.3809L33.553 22.9173"
        stroke={color}
        strokeWidth="6.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
