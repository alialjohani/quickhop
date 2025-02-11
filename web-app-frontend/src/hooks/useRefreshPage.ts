import { useEffect } from "react";

const intervalTime = 5 * 60 * 1000;

const useRefreshPage = (refetch: () => void) => {
  useEffect(() => {
    let isMounted = true;
    // Immediately refetch on mount
    refetch();

    // Set up interval to refetch periodically
    const interval = setInterval(() => {
      if (isMounted) refetch();
    }, intervalTime);

    // Clean up interval on unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refetch]);
};

export default useRefreshPage;
