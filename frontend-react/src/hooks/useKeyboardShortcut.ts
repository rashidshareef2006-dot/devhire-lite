import { useEffect, useRef } from 'react';

interface ShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
  ignoreInputs?: boolean;
}

export function useKeyboardShortcut(
  {
    key,
    ctrlKey,
    metaKey,
    shiftKey,
    altKey,
    enabled = true,
    preventDefault = true,
    ignoreInputs = false,
  }: ShortcutOptions,
  handler: (e: KeyboardEvent) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (ignoreInputs) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          target?.isContentEditable
        ) {
          return;
        }
      }

      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrlKey === undefined || e.ctrlKey === ctrlKey;
      const metaMatch = metaKey === undefined || e.metaKey === metaKey;
      const shiftMatch = shiftKey === undefined || e.shiftKey === shiftKey;
      const altMatch = altKey === undefined || e.altKey === altKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (preventDefault) e.preventDefault();
        handlerRef.current(e);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, ctrlKey, metaKey, shiftKey, altKey, enabled, preventDefault, ignoreInputs]);
}