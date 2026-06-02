export const ModuleKeys = {
  module: () => ["moduleName"] as const,
  fetch_query_name_example: () => [...ModuleKeys.module(), "fetch"] as const,
  create_query_name_example: () => [...ModuleKeys.module(), "create"] as const,
  update_query_name_example: () => [...ModuleKeys.module(), "update"] as const,
  delete_query_name_example: () => [...ModuleKeys.module(), "delete"] as const,
  fetch_infinite_query_name_example: () => [...ModuleKeys.module(), "fetch-infinite"] as const,
  fetch_query_with_params_example: (params: any) => [...ModuleKeys.module(), "fetch-with-params", params] as const,
  fetch_query_by_id_example: (id: string) => [...ModuleKeys.module(), "fetch-by-id", id] as const,
  fetch_query_combo_example: (id: string, params: any) => [...ModuleKeys.module(), "fetch-combo", id, params] as const,
};

/* 
# NOTE: as const is used at end so that keys are immutable
# NOTE : ans insted of standard object keys usd as function so its easy and clean to use and maintain in larger scale
# NOTE : you can change *_name_example to your own query name
 */
