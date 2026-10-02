import React, { ChangeEvent, KeyboardEvent, FocusEvent } from "react";

interface InputProps {
  placeholder: string;
  className?: string;
  value: string;
  autoComplete?: string;
  name?: string;
  id?: string;
  inputRef?: React.RefObject<HTMLInputElement>; // ✅ Fixed Type
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onClick?: () => void; // ✅ Added
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void; // ✅ Added
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void; // ✅ Added
  onTouchStart?: () => void; // ✅ Added for better mobile support
  autoFocus?: boolean;
}
const InputBox: React.FC<InputProps> = ({
  inputRef,
  placeholder,
  className = "",
  value,
  autoComplete = "off",
  name = "",
  id = "",
  onChange,
  onKeyDown,
  onClick,
  onFocus,
  onBlur,
  onTouchStart,
  autoFocus = false, // ✅ Default value set
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    // if (/^[a-zA-Z0-9]*$/.test(newValue)) {
    onChange(newValue);
    // }
  };

  return (
    <input
      type="text"
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onTouchStart={onTouchStart}
      placeholder={placeholder}
      className={className}
      autoComplete={autoComplete}
      autoFocus={autoFocus} // ✅ Now allowed by TypeScript
      name={name}
      id={id}
    />
  );
};

export default InputBox;
