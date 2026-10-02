"use client";

import { useEffect } from "react";

const ScrollToHash = () => {
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // Small delay to ensure the page is fully loaded
          setTimeout(() => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      }
    };

    // Handle initial load with hash
    handleHashScroll();

    // Handle hash changes (in case user navigates with hash)
    const handleHashChange = () => {
      handleHashScroll();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return null;
};

export default ScrollToHash;
