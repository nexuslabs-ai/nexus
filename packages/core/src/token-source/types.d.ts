/** An authored DTCG `$value`: a scalar, a reference string, or a composite. */
export type TokenValue =
  | string
  | number
  | boolean
  | null
  | TokenValue[]
  | { [key: string]: TokenValue };
