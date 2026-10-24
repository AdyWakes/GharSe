// Renders WhatsApp-style formatting: *bold*, _italic_, and line breaks.
// Builds React nodes (never raw HTML), so message text cannot inject markup.
import { Fragment } from "react";

const TOKEN = /(\*[^*\n]+\*|_[^_\n]+_)/g;

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line.split(TOKEN).map((part, j) => {
            if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
              return <strong key={j}>{part.slice(1, -1)}</strong>;
            }
            if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) {
              return <em key={j}>{part.slice(1, -1)}</em>;
            }
            return <Fragment key={j}>{part}</Fragment>;
          })}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
