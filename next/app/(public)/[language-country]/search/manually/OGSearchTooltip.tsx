import { Box } from "@/components/ui/box";
import { useState, ReactNode, useEffect, useRef } from "react";

interface CustomTooltipOGProps {
  content?: ReactNode;
  children: ReactNode;
  triggertype: "hover" | "click";
}

export const CustomTooltipOG = ({
  content,
  children,
  triggertype = "click",
}: CustomTooltipOGProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const events: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
  } = {};

  if (triggertype === "hover") {
    events.onMouseEnter = () => setIsVisible(true);
    events.onMouseLeave = () => setIsVisible(false);
  } else if (triggertype === "click") {
    events.onClick = () => setIsVisible(!isVisible);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    }

    if (triggertype === "click") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [triggertype]);

  return (
    <Box ref={tooltipRef as any} className="relative mb-5 ml-1 inline-block h-auto w-4" {...events}>
      {children}
      {isVisible && (
        <Box className="absolute right-[-185px] top-1/2 z-50 h-auto -translate-y-1/2 transform rounded-[8px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.1)]">
          <Box className="min-w-[160px] max-w-[300px] whitespace-normal px-4 pt-2 text-sm text-color-text-body">
            {content}
            <Box
              className="absolute left-0 top-[45%] h-4 w-4 -translate-x-1/2 rotate-45 transform rounded-bl-[8px] bg-white"
              // @ts-ignore
              style={{
                marginTop: "-4px",
                boxShadow: "-4px 6px 8px rgba(0, 0, 0, 0.10)",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
