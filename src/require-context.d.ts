// Types for webpack's require.context, which Remotion's bundler supports. Used by Root.tsx
// to pick up the gitignored private compositions without importing them by name.
declare namespace NodeJS {
  interface WebpackContext {
    keys(): string[];
    <T = unknown>(id: string): T;
  }

  interface Require {
    context(directory: string, useSubdirectories: boolean, filter: RegExp): WebpackContext;
  }
}
