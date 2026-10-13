import type { CSSProperties } from "react";
import {
  AppWindow, ArrowsClockwise, Browser, CursorClick, Desktop, DeviceMobile, Devices, FlowArrow, Hash, Lightning,
  PenNib, PlugsConnected, ShoppingBagOpen, SquaresFour, Stack, Storefront, UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { IncludedItem } from "@/lib/content";

const ICONS: Record<string, Icon> = {
  marketing: Browser, webapps: AppWindow, ecommerce: ShoppingBagOpen, "perf-seo": Lightning,
  tools: SquaresFour, apis: PlugsConnected, legacy: ArrowsClockwise, automation: FlowArrow,
  product: PenNib, systems: Stack, research: UsersThree, prototyping: CursorClick,
  native: DeviceMobile, cross: Devices, desktop: Desktop, stores: Storefront,
};

/**
 * "What's included": everything visible at once, one icon, title and line per item, dressed for the
 * service. `tabs` (Web and Software Development) shows each item as a window with its name on a tab.
 * `frames` (UI/UX Design) shows each item as a named frame on a design canvas, selected on hover.
 * `notifications` (Apps) shows each item as a phone notification.
 */
export function IncludedGrid({
  items,
  variant,
}: {
  items: IncludedItem[];
  variant: "tabs" | "frames" | "notifications";
}) {
  if (variant === "notifications") {
    return (
      <ul className="notifs">
        {items.map((item, i) => {
          const Glyph = ICONS[item.id] ?? SquaresFour;
          return (
            <li key={item.id} className="notif" data-reveal style={{ "--d": i } as CSSProperties}>
              <span className="notif__head" aria-hidden="true">
                <span className="notif__app">
                  <Glyph size={14} weight="fill" />
                </span>
                Stack Studio
                <span className="notif__time">now</span>
              </span>
              <h3 className="notif__title">{item.title}</h3>
              <p className="notif__text">{item.body}</p>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === "frames") {
    return (
      <ul className="frames">
        {items.map((item, i) => {
          const Glyph = ICONS[item.id] ?? SquaresFour;
          return (
            <li key={item.id} className="frame" data-reveal style={{ "--d": i } as CSSProperties}>
              <span className="frame__label" aria-hidden="true">
                <Hash size={11} weight="bold" />
                {item.title}
              </span>
              <div className="frame__body">
                <span className="included__icon">
                  <Glyph size={22} weight="duotone" aria-hidden />
                </span>
                <h3 className="frame__title">{item.title}</h3>
                <p className="frame__text">{item.body}</p>
                <span className="frame__handles" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="files">
      {items.map((item, i) => {
        const Glyph = ICONS[item.id] ?? SquaresFour;
        return (
          <li key={item.id} className="file" data-reveal style={{ "--d": i } as CSSProperties}>
            <h3 className="file__tab">
              <Glyph size={16} weight="bold" aria-hidden />
              {item.title}
            </h3>
            <p className="file__text">{item.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
