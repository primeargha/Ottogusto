import { forwardRef, useCallback, useMemo } from "react";

import { MinusIcon } from "lucide-react-native";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "../ui/checkbox";
import { CheckIcon } from "../ui/icon";
import { Box } from "../ui/box";
interface OGCheckboxProps {
  type?: "primary" | "title";
  // size?: "small" | "medium" | "large";
  selected?: boolean;
  partial?: boolean;
  disabled?: boolean;
  label: string;
  labelClass?: string;
  defaultIsChecked?: boolean;
  onChange: (state: any, value?: any) => void;
  className?: string;
  value?: any;
}

/**
 * A customizable checkbox component with support for different styles, states, and labels.
 *
 * @component
 * @param {OGCheckboxProps} props - The properties for the OGCheckbox component.
 * @param {string} [props.className] - Additional CSS classes to apply to the checkbox container.
 * @param {string} [props.label] - The label text displayed next to the checkbox.
 * @param {boolean} [props.disabled=false] - Whether the checkbox is disabled.
 * @param {"primary" | "title"} [props.type="primary"] - The style type of the checkbox.
 *        - `"primary"`: Default style with normal font weight and green text.
 *        - `"title"`: Bold style with brand-specific green text.
 * @param {boolean} [props.selected=false] - Whether the checkbox is selected.
 * @param {boolean} [props.partial=false] - Whether the checkbox is in a partially selected state.
 *
 * @returns {JSX.Element} The rendered OGCheckbox component.
 *
 * @example
 * // Basic usage
 * <OGCheckbox
 *   label="Accept Terms"
 *   type="primary"
 *   selected={true}
 *   disabled={false}
 * />
 *
 * @example
 * // Disabled checkbox
 * <OGCheckbox
 *   label="Disabled Option"
 *   type="title"
 *   disabled={true}
 * />
 */
export const OGCheckbox = (props: OGCheckboxProps) => {
  const {
    className = "",
    label,
    labelClass,
    disabled = false,
    type = "primary",
    selected = false,
    partial = false,
    value = null,
    onChange,
    ...rest
  } = props;

  // Memoize class names
  const containerClass = useMemo(() => {
    let base = `flex w-fit flex-row items-center inline-flex rounded-xl justify-center gap-3 cursor-pointer`;
    if (disabled) base += ` cursor-not-allowed`;
    return base;
  }, [disabled]);

  const fontClass = useMemo(() => {
    let base = `line-clamp-2 cursor-pointer font-Overpass text-[16px] capitalize leading-tight pt-1`;

    if (type === "primary") {
      base += ` justify-start text-green-950 text-base font-normal leading-none`;
    } else if (type === "title") {
      base += ` font-bold text-[--brand-traffic-light-green]`;
    }

    if (disabled) {
      base += ` text-green-950 cursor-not-allowed`;
    }

    return base;
  }, [type, disabled]);

  const handleChange = useCallback(
    (e: any) => {
      if (onChange) onChange(e, value);
    },
    [onChange, value],
  );

  // Determine which icon to render
  const icon = useMemo(() => {
    //@ts-ignore
    if (selected && partial) return <CheckboxIcon as={CheckIcon} />;
    //@ts-ignore
    if (selected && !partial) return <CheckboxIcon as={CheckIcon} />;
    //@ts-ignore
    if (!selected && partial) return <CheckboxIcon as={MinusIcon} />;
    return <CheckboxIcon />;
  }, [selected, partial]);

  const checkboxId = `checkbox-${value || label}`;

  return (
    <Checkbox
      size="md"
      isDisabled={disabled}
      {...rest}
      onChange={handleChange}
      className={`${containerClass} w-full justify-start py-space-xs`}
      isChecked={selected || partial}
      aria-label={label}
      id={checkboxId}
      value={value}
    >
      <Box className="inline-flex items-center justify-start gap-2.5 rounded-md p-0.5 hover:bg-green-600 hover:bg-opacity-20">
        {/*@ts-ignore */}
        <CheckboxIndicator className="h-[18px] w-[18px] rounded-md border border-stone-300 bg-white">
          {icon}
        </CheckboxIndicator>
      </Box>
      {/*@ts-ignore */}
      <CheckboxLabel
        htmlFor={checkboxId}
        className={
          labelClass ? labelClass : `${fontClass} line-clamp-1 overflow-hidden text-ellipsis`
        }
      >
        {label}
      </CheckboxLabel>
    </Checkbox>
  );
};
