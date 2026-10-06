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
 * service. `code` (Web and Software Development) shows each item as a file open in an editor tab.
 * `frames` (UI/UX Design) shows each item as a named frame on a design canvas, selected on hover.
 * `notifications` (Apps) shows each item as a phone notification.
 */
export function IncludedGrid({
  items,
  variant,
  ext = "tsx",
}: {
  items: IncludedItem[];
  variant: "code" | "frames" | "notifications";
  /** File extension shown on the editor tabs in the `code` variant. */
  ext?: string;
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
            <div className="file__tab mono" aria-hidden="true">
              <Glyph size={14} weight="bold" />
              {item.id}.{ext}
            </div>
            <div className="file__body">
              <span className="file__ln mono" aria-hidden="true">
                1<br />2
              </span>
              <div>
                <h3 className="file__title">{item.title}</h3>
                <p className="file__text mono">
                  <span aria-hidden="true">{"// "}</span>
                  {item.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
