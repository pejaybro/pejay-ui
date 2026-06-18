import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  twoData: "",
  meta: {
    requiresAuth: true,
  },
};

const twoSlice = createSlice({
  name: "two",
  initialState,
  reducers: {
    setTwo: (state, action) => {
      state.twoData = action.payload;
    },
  },
});

export const { setTwo } = twoSlice.actions;
export default twoSlice.reducer;
