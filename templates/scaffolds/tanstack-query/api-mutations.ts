import { ModuleMutations } from "./module";

export const apiMutations = {
  module: ModuleMutations,
};

export * from "./module";

/* 
 # NOTE : here you export all the mutations from the module folder so it will be easy to import in components

  const queryClient = useQueryClient();
  const mutation_name_example = useMutation(ModuleMutations.create_query_name_example(queryClient));
  mutation_name_example.mutate({input_name: data})
*/
