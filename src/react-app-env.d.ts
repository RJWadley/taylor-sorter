/// <reference types="react-scripts" />

export {};

declare global {
  interface Window {
    Success: any; // 👈️ turn off type checking
    Failure: any; // 👈️ turn off type checking
  }
}
