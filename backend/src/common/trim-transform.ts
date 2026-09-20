// class-transformer's TransformFnParams types `value` as `any` — this gives
// the common "@Transform(({ value }) => value?.trim())" DTO pattern a typed
// callback instead. Non-string input passes through unchanged rather than
// throwing (a bad request body should fail @IsString() with a clean
// validation error, not crash the transform step itself).
export function trimIfString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
