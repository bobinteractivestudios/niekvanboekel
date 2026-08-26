import type { ReactNode } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const TRAILING_PUNCTUATION = /[.,!?;:'")\]]+$/;

/**
 * Turns any http(s):// or www. links in plain text into clickable anchors,
 * leaving the rest as-is. Trailing sentence punctuation (a period closing
 * the sentence, a wrapping parenthesis, ...) is kept out of the link itself.
 */
export function linkify(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const pattern = new RegExp(URL_PATTERN);
  while ((match = pattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const start = match.index;

    const trailingMatch = fullMatch.match(TRAILING_PUNCTUATION);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const urlText = trailing ? fullMatch.slice(0, -trailing.length) : fullMatch;

    if (!urlText) continue;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    const href = /^https?:\/\//i.test(urlText) ? urlText : `https://${urlText}`;
    parts.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 decoration-border hover:decoration-foreground break-words"
      >
        {urlText}
      </a>
    );

    lastIndex = start + urlText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
