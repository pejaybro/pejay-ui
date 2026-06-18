import { baseApi } from "./baseApi";

export const apiMiddleware = [baseApi.middleware];

/* 

    *in store.ts
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...apiMiddleware)

*/
