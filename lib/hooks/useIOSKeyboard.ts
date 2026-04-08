import { useState, useEffect } from 'react';

/**
 * Tracks the software keyboard height on iOS Safari using the visualViewport API.
 * Returns 0 on non-iOS or desktop browsers.
 */
export function useIOSKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      // When the keyboard opens, visualViewport.height shrinks while
      // window.innerHeight stays the same. The difference is the keyboard.
      const diff = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardHeight(Math.max(0, diff));
    };

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  return { keyboardHeight, isKeyboardOpen: keyboardHeight > 0 };
}
