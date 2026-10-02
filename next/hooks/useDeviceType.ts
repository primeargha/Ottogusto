import { useState, useEffect } from "react";

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState("laptop"); // Default: Laptop

  useEffect(() => {
    const getDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width >= 768 && width <= 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("laptop");
      }
    };

    getDeviceType(); // Check on mount
    window.addEventListener("resize", getDeviceType);

    return () => window.removeEventListener("resize", getDeviceType);
  }, []);

  return deviceType;
};

export default useDeviceType;
