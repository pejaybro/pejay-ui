import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import { ModuleKeys } from "./keys";
import { ModuleService } from "./services";

export const ModuleMutations = {
  create_query_name_example: (queryClient: QueryClient) =>
    mutationOptions({
      mutationFn: (newItem: any) =>
        ModuleService.post_query_name_example(newItem),
      onMutate: async (newItem: any) => {
        /* 
        # OPTIMISTIC UPDATE TECHNIQUE:
        1. Cancel outgoing refetches so they don't overwrite our optimistic update.
        2. Snapshot the current cache value.
        3. Optimistically insert the new item into the cache.
        4. Return context containing the previous value for error rollbacks.
        */
        await queryClient.cancelQueries({ queryKey: ModuleKeys.fetch_query_name_example() });

        const previousItems = queryClient.getQueryData(ModuleKeys.fetch_query_name_example());

        queryClient.setQueryData(ModuleKeys.fetch_query_name_example(), (old: any) => {
          return old ? [...old, newItem] : [newItem];
        });

        return { previousItems };
      },
      onSuccess: async () => {
        /* 
        # NOTE: In case of mutations, invalidate query keys to refresh with fresh server data.
        */
        await queryClient.invalidateQueries({
          queryKey: ModuleKeys.fetch_query_name_example(),
        });
      },
      onError: (error, newItem, context: any) => {
        /* 
        # ROLLBACK ON FAILURE:
        If the mutation fails, rollback the cache to our snapshotted state.
        */
        if (context?.previousItems) {
          queryClient.setQueryData(
            ModuleKeys.fetch_query_name_example(),
            context.previousItems
          );
        }
      },
      onSettled: async () => {
        // Always refetch after error or success to keep server in sync
        await queryClient.invalidateQueries({
          queryKey: ModuleKeys.fetch_query_name_example(),
        });
      },
    }),
};
