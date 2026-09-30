import { Children, cloneElement, createElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

/**
 * Heading whose words slide up one after another when it scrolls into view (via RevealObserver's
 * `.is-in`). Words stay real text nodes with real spaces, so screen readers and copy/paste are unaffected.
 * Nested elements such as <em> keep their styling; their words are split too.
 */
export function SplitHeading({
  as = "h2",
  className = "",
  style,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  let index = 0;

  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((part, k) =>
        !part ? null : /^\s+$/.test(part) ? (
          part
        ) : (
          <span className="sw" key={k}>
            <span style={{ "--w": index++ } as CSSProperties}>{part}</span>
          </span>
        ),
      );
    }
    if (isValidElement(node)) {
      const el = node as ReactElement<{ children?: ReactNode }>;
      return cloneElement(el, undefined, Children.map(el.props.children, walk));
    }
    return node;
  };

  return createElement(
    as,
    { className: `split ${className}`.trim(), style, "data-reveal": "" },
    Children.map(children, walk),
  );
}
