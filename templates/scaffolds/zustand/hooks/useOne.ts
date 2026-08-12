import { useOneStore } from "../stores/one.store";

export const useOne = () => {
  const oneData = useOneStore((s) => s.oneData);
  const status = useOneStore((s) => s.status);
  const isLoading = useOneStore((s) => s.isLoading);
  const isError = useOneStore((s) => s.isError);
  const error = useOneStore((s) => s.error);

  const setOne = useOneStore((s) => s.setOne);
  const setStatus = useOneStore((s) => s.setStatus);

  return { oneData, status, isLoading, isError, error, setOne, setStatus };
};
