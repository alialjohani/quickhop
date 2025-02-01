import { useEffect } from "react";

const intervalTime = 5 * 60 * 1000;

const useRefreshPage = (refetch: () => void) => {
  useEffect(() => {
    // Immediately refetch on mount
    refetch();

    // Set up interval to refetch periodically
    const interval = setInterval(() => {
      refetch();
    }, intervalTime);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [refetch, intervalTime]);
};

export default useRefreshPage;
