"use client";

import { useState } from "react";
import type { IncludedItem } from "@/lib/content";

/**
 * "What's included" tiles. Hover flips on pointer devices (pure CSS);
 * click/tap toggles a persistent flip so touch users can reach the back face.
 */
export function FlipGrid({ items }: { items: IncludedItem[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <ul className="flip-grid">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="flip"
            aria-pressed={!!flipped[item.id]}
            onClick={() => setFlipped((f) => ({ ...f, [item.id]: !f[item.id] }))}
          >
            <span className="flip__inner">
              <span className="flip__face flip__face--front" aria-hidden="true">
                <span className="flip__icon" />
                <span className="flip__title">{item.title}</span>
              </span>
              <span className="flip__face flip__face--back">
                <span className="flip__kicker">{item.title}</span>
                <span className="flip__body">{item.body}</span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
