import { createSlice } from "@reduxjs/toolkit";

interface InitialStateType {
  isSpinning: boolean;
}

const initialState: InitialStateType = {
  isSpinning: false,
};

const spinnerSlice = createSlice({
  name: "spinner",
  initialState,
  reducers: {
    enableSpinner: (state) => {
      state.isSpinning = true;
    },
    disableSpinner: (state) => {
      state.isSpinning = false;
    },
  },
});

export default spinnerSlice.reducer;
export const { enableSpinner, disableSpinner } = spinnerSlice.actions;
