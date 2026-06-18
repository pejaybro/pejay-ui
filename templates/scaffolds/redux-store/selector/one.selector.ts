import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";

export const selectOneSlice = (state: RootState) => state.one;
export const oneSelector = createSelector([selectOneSlice], (state) => {
  if (state.oneData) {
    return state.oneData;
  } else {
    return null;
  }
});

/*

# NOTE : Its primary job is:
1. Memoize expensive calculations
2. Return stable references (same array/object if inputs didn't change)
3. Prevent unnecessary recalculations and re-renders


now after this setp of selctor 
we can handover all the states and memoised data to hook which can be called inside any number of component 
it will save our time and code from repeating the code again and again 

# NOTE : example

// hooks/useOne.ts
import { useSelector } from "react-redux";
import { selectOneSlice } from "../store/selector/one.selector";


export const useOne = () => {
  const one = useSelector(selectOneSlice);
  const { isLoading, isFetching, isError } = useSelector((state) => state.one);
   any additional manipulation specific to component can be done here
  return { one, isLoading, isFetching, isError };
};

 usage in any component
import { useOne } from "../hooks/useOne";
const { one, isLoading, isFetching, isError } = useOne();

*/
