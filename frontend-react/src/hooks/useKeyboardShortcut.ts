import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: { ctrl?: boolean; meta?: boolean; ignoreInputs?: boolean } = {},
) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (options.ignoreInputs) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      }

      if (options.ctrl && !e.ctrlKey) return;
      if (options.meta && !e.metaKey) return;

      if (e.key === key) {
        handler();
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, options.ctrl, options.meta, options.ignoreInputs]);
}