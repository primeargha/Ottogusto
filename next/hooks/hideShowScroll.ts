import { useEffect, useState } from "react";

const useScrollDirection = (): boolean => {
  const [show, setShow] = useState<boolean>(true);

  useEffect(() => {
    let lastScrollY: number = window.scrollY;

    const handleScroll = (): void => {
      const currentScrollY: number = window.scrollY;

      // avoid tiny scroll jitter
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;
      if (currentScrollY > lastScrollY) {
        // scrolling down → hide
        setShow(false);
      } else {
        // scrolling up → show
        setShow(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return show;
};

export default useScrollDirection;
