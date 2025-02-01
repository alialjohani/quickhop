import { useCallback, useEffect } from "react";
import { useLazyGetDownloadableUrlQuery } from "../app/slices/apiSlice";
import { QueryActionCreatorResult } from "@reduxjs/toolkit/query";

type TriggerDownloadFunction = (arg?: any) => QueryActionCreatorResult<any>;

const useFileDownload = (): [TriggerDownloadFunction, boolean, boolean] => {
  const [triggerDownload, { data, isLoading, isError }] =
    useLazyGetDownloadableUrlQuery();

  useEffect(() => {
    if (data) {
      downloadFile(data.data);
    }
  }, [data]);

  const downloadFile = useCallback((url: string) => {
    const a = document.createElement("a"); // Create an anchor element
    a.href = url; // Set the file URL
    a.target = "_blank"; // Open the file in a new tab
    document.body.appendChild(a); // Append the anchor to the body
    a.click(); // Simulate a click
    document.body.removeChild(a); // Remove the anchor after triggering download
  }, []);

  return [triggerDownload, isLoading, isError];
};

export default useFileDownload;
