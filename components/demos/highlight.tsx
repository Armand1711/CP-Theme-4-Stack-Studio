import type { ReactNode } from "react";

/*
 * A tiny syntax highlighter for the short, hand-written snippets in the service demos. It only knows the
 * token shapes those snippets use; it is not a general-purpose highlighter.
 */

export type Lang = "html" | "css" | "js" | "json";

const PATTERNS: Record<Lang, RegExp> = {
  html: /(?<tag><\/?[\w-]+|\/?>)|(?<attr>\s[\w-]+(?==))|(?<str>"[^"]*")|(?<comment><!--.*?-->)/g,
  css: /(?<comment>\/\*.*?\*\/)|(?<at>@[\w-]+)|(?<sel>^\s*[.#][\w-]+)|(?<prop>[\w-]+(?=\s*:))|(?<num>\b\d+(?:\.\d+)?(?:px|fr|%)?)|(?<kw>\b(?:none|grid|inline-size|repeat|max-width)\b)/g,
  js: /(?<comment>\/\/.*$)|(?<kw>\b(?:const|let|return|export)\b)|(?<str>"[^"]*")|(?<prop>[\w-]+(?=\s*:))/g,
  json: /(?<prop>"[^"]*"(?=\s*:))|(?<str>"[^"]*")|(?<num>-?\b\d+(?:\.\d+)?\b)|(?<kw>\b(?:true|false|null)\b)/g,
};

/** Splits one line of code into coloured spans (class `tok tok--{kind}`). */
export function highlight(code: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(PATTERNS[lang].source, "g");
  let last = 0;
  for (const m of code.matchAll(re)) {
    const kind = Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0];
    if (!kind || m.index === undefined) continue;
    if (m.index > last) out.push(code.slice(last, m.index));
    out.push(
      <span key={m.index} className={`tok tok--${kind}`}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
