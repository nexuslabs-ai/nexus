/** An authored DTCG `$value`: a scalar, a reference string, or a composite. */
export type TokenValue =
  | string
  | number
  | boolean
  | null
  | readonly TokenValue[]
  | { readonly [key: string]: TokenValue };
