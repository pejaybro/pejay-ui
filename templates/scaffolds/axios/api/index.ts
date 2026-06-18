export * as oneAPI from "./one.api";
/* 

to call we simply do 

import {oneAPI} from "@/api"

oneAPI.onePost({ payload: data });

oneAPI.oneGet();

oneAPI.oneGetId({ id: "1" });

* calling abort via signal
const controller = new AbortController();
oneAPI.oneGetIdParams({ id: "1", params: { search:"adam" }, signal: controller.signal, });

controller.abort();

* aborts request on unmount
useEffect(() => {
  const controller = new AbortController();

  oneAPI.oneGetIdParams({
    id: "1",
    params: { search: "adam" },
    signal: controller.signal,
  });

  return () => {
    controller.abort();
  };
}, []);


oneAPI.onePut({ id: "1", payload: data });

oneAPI.oneDelete({ id: "1" });

*/
