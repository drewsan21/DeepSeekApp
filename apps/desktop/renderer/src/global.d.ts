import type { DeepSeekDesktopApi } from '@deepseek/shared';

declare global {
  interface Window {
    deepseek: DeepSeekDesktopApi;
  }
}

export {};
