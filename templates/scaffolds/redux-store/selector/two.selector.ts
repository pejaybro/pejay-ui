import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";

export const selectTwoSlice = (state: RootState) => state.two;
export const twoSelector = createSelector([selectTwoSlice], (state) => {
  if (state.twoData) {
    return state.twoData;
  } else {
    return null;
  }
});
