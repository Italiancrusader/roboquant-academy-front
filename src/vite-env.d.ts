
/// <reference types="vite/client" />

declare global {
  interface Window {
    fbq: (command: string, eventName: string, params?: any) => void;
    _fbq: any;
  }
}
