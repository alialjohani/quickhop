/**
 * useModalBackdrop.tsx
 *
 * This is only to add the feel and the style of 'modal-backdrop' to background when the modal is opened.
 */

import { useEffect } from "react";

const useModalBackdrop = (isModalOpen: boolean) => {
  useEffect(() => {
    if (isModalOpen) {
      // Add 'modal-open' class to body to prevent background scroll
      document.body.classList.add("modal-open");

      // Create and append backdrop
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);

      // Cleanup when modal closes
      return () => {
        document.body.classList.remove("modal-open");
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
      };
    }
  }, [isModalOpen]);
};

export default useModalBackdrop;
