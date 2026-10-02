"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className: string;
  priority: boolean;
};

const placeholder = "/assets/profile/placeholder-profile-image.png";

const OGProfileImage = (props: Props) => {
  const { src, height, width, alt, className, priority } = props;
  const [imgSrc, setImgSrc] = useState(src || placeholder);

  // Update imgSrc if src prop changes
  useEffect(() => {
    setImgSrc(src || placeholder);
  }, [src]);

  const handleError = useCallback(() => {
    setImgSrc(placeholder);
  }, []);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      className={className}
      priority={priority}
    />
  );
};

export default OGProfileImage;
