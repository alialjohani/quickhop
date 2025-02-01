import { createSlice } from "@reduxjs/toolkit";
// import { RootState } from "../store/store";

interface InitialStateType {
  isOpen: boolean;
}

const initialState: InitialStateType = {
  isOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isOpen = true;
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
  },
});

export default modalSlice.reducer;
export const { openModal, closeModal } = modalSlice.actions;
