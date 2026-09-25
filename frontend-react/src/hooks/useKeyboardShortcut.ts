import { useEffect } from 'react';

interface ShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  { key, ctrlKey, metaKey, shiftKey, altKey, enabled = true, preventDefault = true }: ShortcutOptions,
  handler: (e: KeyboardEvent) => void,
) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrlKey === undefined || e.ctrlKey === ctrlKey;
      const metaMatch = metaKey === undefined || e.metaKey === metaKey;
      const shiftMatch = shiftKey === undefined || e.shiftKey === shiftKey;
      const altMatch = altKey === undefined || e.altKey === altKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (preventDefault) e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, ctrlKey, metaKey, shiftKey, altKey, enabled, preventDefault, handler]);
}