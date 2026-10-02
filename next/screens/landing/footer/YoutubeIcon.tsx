import React from "react";

interface YoutubeIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const YoutubeIcon: React.FC<YoutubeIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path
        d="M18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM7.5 12.5V3.5L14.5 8L7.5 12.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default YoutubeIcon;
