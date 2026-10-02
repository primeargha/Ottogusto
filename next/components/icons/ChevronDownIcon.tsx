import React from "react";

type ChevronDownIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M6.175 6.91248L10 10.7291L13.825 6.91248L15 8.08748L10 13.0875L5 8.08748L6.175 6.91248Z"
        fill="#9C9886"
      />
    </svg>
  );
};

export default ChevronDownIcon;
