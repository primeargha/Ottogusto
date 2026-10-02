export function CSSVariablesExample() {
  return (
    <div className="m-2 bg-[var(--color-beige-200)] p-5 text-[var(--color-tarmac-950m)]">
      <h2 className="font-bold text-[var(--font-size-lg)]">CSS Variables Example</h2>
      <p className="text-[var(--font-size-md)]">
        This uses CSS variables that are automatically generated from the theme configuration.
      </p>

      <div className="mt-4 space-y-2">
        <div className="rounded bg-color-primary-main p-3 text-[var(--color-white)]">
          Piston 900 Background
        </div>

        <div className="rounded bg-[var(--color-racing-500)] p-3 text-[var(--color-white)]">
          Racing 500 Background
        </div>

        <div className="rounded bg-[var(--color-traffic-400)] p-3 text-[var(--color-white)]">
          Traffic 400 Background
        </div>

        <div className="rounded bg-[var(--color-highway-300)] p-3 text-[var(--color-black)]">
          Highway 300 Background
        </div>
      </div>

      <div className="mt-4">
        <button className="rounded bg-[var(--color-piston-600)] px-4 py-2 text-[var(--color-white)] hover:bg-[var(--color-piston-700)]">
          Themed Button
        </button>
      </div>

      <div className="mt-4 text-[var(--font-size-sm)]">
        <p>
          Font Size Small: <span className="text-[var(--font-size-sm)]">This text</span>
        </p>
        <p>
          Font Size Medium: <span className="text-[var(--font-size-md)]">This text</span>
        </p>
        <p>
          Font Size Large: <span className="text-[var(--font-size-lg)]">This text</span>
        </p>
        <p>
          Font Size XL: <span className="text-[var(--font-size-xl)]">This text</span>
        </p>
      </div>
    </div>
  );
}
