import { useRef, useEffect, useCallback } from 'react';

/**
 * Smart auto-scroll that only scrolls when the user is already at the bottom.
 * Uses scrollTop instead of scrollIntoView to avoid iOS Safari pushing
 * ancestor fixed-position containers off-screen.
 */
export function useAutoScroll(deps: { messageCount: number; isStreaming: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Track whether the user is at the bottom via IntersectionObserver
  useEffect(() => {
    const bottom = bottomRef.current;
    const scroll = scrollRef.current;
    if (!bottom || !scroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isAtBottomRef.current = entry.isIntersecting;
      },
      { root: scroll, threshold: 0.1 },
    );

    observer.observe(bottom);
    return () => observer.disconnect();
  }, []);

  const doScroll = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  // Auto-scroll on new messages / streaming updates, but only when at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      requestAnimationFrame(() => doScroll(true));
    }
  }, [deps.messageCount, deps.isStreaming, doScroll]);

  // Explicit scroll-to-bottom (called on send — always scrolls)
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      doScroll(false);
      isAtBottomRef.current = true;
    });
  }, [doScroll]);

  return { scrollRef, bottomRef, scrollToBottom };
}
