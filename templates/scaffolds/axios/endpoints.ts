const createResourceEndpoints = (base: string) => ({
  BASE: base,
  BY_ID: (id: string) => `${base}/${id}`,
});

export const ENDPOINTS = {
  USER: createResourceEndpoints("/user"),
  CATEGORY_2: createResourceEndpoints("/category-2"),
};
