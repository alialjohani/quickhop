// useScrollToTop.js
import { useCallback } from "react";

const useScrollToTop = () => {
  // Function to scroll to the top of the page
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return scrollToTop;
};

export default useScrollToTop;
