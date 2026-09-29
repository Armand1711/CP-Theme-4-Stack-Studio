"use client";

import { useState, type CSSProperties } from "react";
import {
  AppWindow, ArrowsClockwise, Browser, CursorClick, Desktop, DeviceMobile, Devices, FlowArrow, Lightning,
  PenNib, PlugsConnected, ShoppingBagOpen, SquaresFour, Stack, Storefront, UsersThree, type Icon,
} from "@phosphor-icons/react";
import type { IncludedItem } from "@/lib/content";

const ICONS: Record<string, Icon> = {
  marketing: Browser, webapps: AppWindow, ecommerce: ShoppingBagOpen, "perf-seo": Lightning,
  tools: SquaresFour, apis: PlugsConnected, legacy: ArrowsClockwise, automation: FlowArrow,
  product: PenNib, systems: Stack, research: UsersThree, prototyping: CursorClick,
  native: DeviceMobile, cross: Devices, desktop: Desktop, stores: Storefront,
};

/**
 * "What's included" tiles. Hover flips on pointer devices (pure CSS);
 * click/tap toggles a persistent flip so touch users can reach the back face.
 */
export function FlipGrid({ items }: { items: IncludedItem[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <ul className="flip-grid">
      {items.map((item, i) => {
        const Glyph = ICONS[item.id] ?? SquaresFour;
        return (
          <li key={item.id} data-reveal style={{ "--d": i } as CSSProperties}>
            <button
              type="button"
              className="flip"
              aria-pressed={!!flipped[item.id]}
              onClick={() => setFlipped((f) => ({ ...f, [item.id]: !f[item.id] }))}
            >
              <span className="flip__inner">
                <span className="flip__face flip__face--front" aria-hidden="true">
                  <span className="flip__icon">
                    <Glyph size={22} weight="duotone" />
                  </span>
                  <span className="flip__title">{item.title}</span>
                </span>
                <span className="flip__face flip__face--back">
                  <span className="flip__kicker">{item.title}</span>
                  <span className="flip__body">{item.body}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
