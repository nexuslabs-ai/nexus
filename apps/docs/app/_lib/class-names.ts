/** Appends a caller-supplied className to a base class string. */
export const join = (base: string, incoming?: string) =>
  incoming ? `${base} ${incoming}` : base;
