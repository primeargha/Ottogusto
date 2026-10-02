// components/SecurityIcon.tsx (or ShieldIcon.tsx)
export const SecurityIcon = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.9999 2.66663L5.33325 6.66663V14.7866C5.33325 21.52 9.87992 27.8 15.9999 29.3333C22.1199 27.8 26.6666 21.52 26.6666 14.7866V6.66663L15.9999 2.66663ZM23.9999 14.7866C23.9999 20.12 20.5999 25.0533 15.9999 26.56C11.3999 25.0533 7.99992 20.1333 7.99992 14.7866V8.41329L15.9999 5.58663L23.9999 8.41329V14.7866ZM11.7599 14.12L9.86659 16L14.5866 20.72L22.1333 13.1733L20.2533 11.2933L14.5999 16.9466L11.7599 14.12Z"
        fill="currentColor"
      />
    </svg>
  );
};
