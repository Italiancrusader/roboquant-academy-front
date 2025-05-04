
/// <reference types="vite/client" />

interface Window {
  fbq?: (command: string, eventName: string, params?: any) => void;
  _fbq?: any;
}

declare function fbq(command: string, eventName: string, params?: any): void;
