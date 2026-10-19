// `generate:manifest` fails any content page without this export.
declare module '*.mdx' {
  export const description: string;
}
