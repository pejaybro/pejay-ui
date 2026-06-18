export const queryTags = ["Data"] as const;

type TagType = (typeof queryTags)[number];

/** Invalidate tag ids only when the mutation succeeds (skip on error). */
export function invalidateTagIdOnSuccess(...types: TagType[]) {
  return (
    _result: unknown,
    error: unknown,
    arg: { id: string | number },
  ) =>
    error ? [] : types.map((type) => ({ type, id: arg.id }));
}
