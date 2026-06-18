import { combineReducers } from "@reduxjs/toolkit";
import oneReducer from "./slices/one.slice";
import twoReducer from "./slices/two.slice";
import { persistReducer } from "redux-persist";
import storageLocal from "redux-persist/lib/storage";
/* import storageSession from "redux-persist/lib/storage/session"; */

/*

# NOTE : combineReducers is used to combine multiple reducers into a single reducer
*/

/* this is per slice config you have to define multiple if you have multi-slice persisted reducers */
const twoConfig = {
  key: "two",
  storage: storageLocal,
  whitelist: [],
  blacklist: [],
};
const persistedReducers = {
  two: persistReducer(twoConfig, twoReducer),
};

const reducres = { one: oneReducer };
export const rootReducer = combineReducers({
  ...reducres,
  ...persistedReducers,
});
export type RootReducerState = ReturnType<typeof rootReducer>;
export default rootReducer;
