"use client";

import { useEffect } from "react";

/*
 * Hover-to-play illustrations (see "Looping illustrations" in globals.css) run faster than their resting
 * loop while hovered or focused, so a quick hover still shows the whole idea. Autoplay cards keep their
 * normal pace. Keep CARDS in sync with the selector list in globals.css.
 */
const CARDS = ".bento__link, .stile, .pcard, .next__tile, .hero__mini, .stack-card, .case, .stack";
const RATE = 1.75;

export function HoverPlayback() {
  useEffect(() => {
    const speedUp = (event: Event) => {
      const card = (event.target as Element | null)?.closest?.(CARDS);
      if (!card || card.classList.contains("autoplay")) return;
      // Wait a frame so the :hover/:focus-within styles have started the animations.
      requestAnimationFrame(() => {
        for (const animation of card.getAnimations({ subtree: true })) {
          if (animation instanceof CSSAnimation) animation.playbackRate = RATE;
        }
      });
    };
    document.addEventListener("pointerover", speedUp);
    document.addEventListener("focusin", speedUp);
    return () => {
      document.removeEventListener("pointerover", speedUp);
      document.removeEventListener("focusin", speedUp);
    };
  }, []);

  return null;
}
