import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { disableSpinner, enableSpinner } from "../app/slices/spinnerSlice";

const useSpinner = (isSpinning: boolean[]) => {
  const dispatch = useDispatch();

  const anySpinning = useMemo(
    () => isSpinning.some((value) => value),
    [isSpinning],
  );
  const allStopped = useMemo(
    () => isSpinning.every((value) => !value),
    [isSpinning],
  );

  useEffect(() => {
    if (anySpinning) {
      dispatch(enableSpinner());
    } else if (allStopped) {
      dispatch(disableSpinner());
    }
  }, [anySpinning, allStopped, dispatch]);
};

export default useSpinner;
