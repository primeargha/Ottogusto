import React from "react";

interface LeftArrowPageProps {
  className?: string;
  onClick?: () => void;
}

const LeftArrowPage: React.FC<LeftArrowPageProps> = ({ className = "", onClick }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer ${className}`}
      fill="none"
      onClick={onClick}
    >
      <path
        d="M26.6666 14.6668H10.44L17.8933 7.2135L16 5.3335L5.33331 16.0002L16 26.6668L17.88 24.7868L10.44 17.3335H26.6666V14.6668Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default LeftArrowPage;
