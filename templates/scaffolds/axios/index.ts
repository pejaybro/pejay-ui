import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
const api = axios.create({ timeout: 5000 });
This specific request uses a 30-second timeout instead
await api.get("/slow-endpoint", { timeout: 30000 });
*/

/* 
TO integrate
1. Generic response typing (HIGH PRIORITY)
2. Error normalization utility
3. Network error utility
4. File upload helpers
5. File download helpers
6. Refresh-token queue
7. Monitoring hooks
*/
