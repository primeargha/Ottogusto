"use client";
import { FORCE_iPAD } from "@/config/app";
import { useState, useEffect } from "react";

const useIpadDetection = () => {
  const [isIpad, setIsIpad] = useState(false);

  useEffect(() => {
    const DetectIpad = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/ipad/i.test(userAgent)) {
        return true;
      }
      if (userAgent.toLowerCase().indexOf("macintosh") > -1) {
        if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
          return true;
        }
        return FORCE_iPAD; // for Chrome Developer Tools
      }
      return false;
    };
    setIsIpad(DetectIpad());
  }, []);

  return isIpad;
};

export default useIpadDetection;
