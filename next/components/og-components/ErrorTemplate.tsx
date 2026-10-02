"use client";
import { Box } from "@/components/ui/box";
import { OGButton } from "@/components/og-components/OGButton";
import Typography from "@/components/og-components/Typography";
import Image from "next/image";
import React from "react";

interface ErrorTemplateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick?: () => void;
  imageSrc?: string | any; // `any` to support imported SVG modules
}

export const ErrorTemplate: React.FC<ErrorTemplateProps> = ({
  title,
  description,
  buttonLabel,
  onButtonClick,
  imageSrc,
}) => {
  return (
    <Box className="flex min-h-[80vh] w-full flex-col">
      {/* Radial Glow Vignette Effect */}
      <Box
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor:
            "radial-gradient(circle at center, transparent 0%, rgba(186, 230, 253, 0.2) 100%)",
        }}
      />
      <Box className="relative z-10 flex h-full w-full items-center justify-center text-center">
        <Box className="flex w-full flex-col items-center gap-4">
          {imageSrc && (
            <Image
              src={imageSrc}
              className="h-40 w-auto"
              alt="Error Illustration"
              width={320}
              height={160}
              priority
            />
          )}
          <Typography type="h1" className="text-center text-[#525049] typography-display-01">
            {title}
          </Typography>
          <Typography type="h3" className="text-center text-[#6E6959] typography-subtitle-01">
            {description}
          </Typography>
          <OGButton
            type="primary"
            size="medium"
            onClick={onButtonClick ?? (() => window.location.replace("/"))}
            className="mt-4"
          >
            {buttonLabel}
          </OGButton>
        </Box>
      </Box>
    </Box>
  );
};
