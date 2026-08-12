import { createStore } from "../core/create-store";

export const oneStatus = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
} as const;

export type OneStatus = (typeof oneStatus)[keyof typeof oneStatus];

type OneState = {
  oneData: string | null;
  status: OneStatus;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  meta: {
    requiresAuth: boolean;
  };

  setOne: (data: string | null) => void;
  setStatus: (status: OneStatus) => void;
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
};

export const useOneStore = createStore<OneState>(
  (set) => ({
    oneData: null,
    status: oneStatus.idle,
    isLoading: false,
    isError: false,
    error: null,
    meta: {
      requiresAuth: true,
    },

    setOne: (data) => set({ oneData: data }),
    setStatus: (status) => set({ status }),
    setError: (error) =>
      set({ isError: true, error, status: oneStatus.error }),
    setIsLoading: (loading) =>
      set({
        isLoading: loading,
        status: loading ? oneStatus.loading : oneStatus.idle,
        isError: false,
        error: null,
      }),
  }),
  {
    name: "one",
    devtools: true,
    resetOnLogout: true,
  },
);

/*
# NOTE: selective subscribe — avoids unnecessary re-renders

const oneData = useOneStore((s) => s.oneData);
const setOne = useOneStore((s) => s.setOne);

# NOTE: subscribes to the entire store — avoid in perf-sensitive UI

const { oneData, setOne } = useOneStore();

# NOTE: async fetch example (no thunk needed — logic lives in the store)

fetchOne: async () => {
  set({ isLoading: true, status: oneStatus.loading });
  try {
    const res = await fetch("/api/one");
    const data = await res.json();
    set({ oneData: data, isLoading: false, status: oneStatus.success });
  } catch (e) {
    set({
      isError: true,
      error: String(e),
      status: oneStatus.error,
      isLoading: false,
    });
  }
},
*/
