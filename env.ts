/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PASSWORD?: string;
  readonly API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    PASSWORD?: string;
    API_KEY?: string;
  }
}

