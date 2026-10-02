import * as React from "react";

type ListViewIconProps = React.SVGProps<SVGSVGElement>;

const ListViewIcon: React.FC<ListViewIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 22"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7ZM3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default ListViewIcon;
