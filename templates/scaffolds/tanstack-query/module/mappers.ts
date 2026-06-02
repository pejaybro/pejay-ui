/* 
# NOTE : you can change *_name_example to your own query name 
# NOTE : you can change raw to your own data after manipulation 
*/

export const ModuleMappers = {
  fetch_query_name_example(raw: any) {
    const data = raw || "manipulate your data here and then return it";
    return data;
  },
  fetch_infinite_query_example(raw: any) {
    const data = raw || [];
    return data;
  },
};
