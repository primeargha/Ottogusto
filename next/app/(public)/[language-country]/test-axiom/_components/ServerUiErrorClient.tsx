"use client";

/** Renders list from API-shaped data; null items triggers error boundary → ui_error in Axiom. */
export function ServerUiErrorClient({ items }: { items: string[] | null }) {
  return (
    <ul>
      {items!.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
