export default function Page() {
  return (
    <main className="bg-bg text-ink min-h-screen p-3xl">
      <p
        className="text-mono text-xs text-ink-muted mb-md"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        // smoke test — phase 1
      </p>

      <h1
        className="font-display text-5xl"
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"wdth" 60',
          fontWeight: 800,
        }}
      >
        Today.
      </h1>

      <div
        className="mt-2xl p-lg bg-paper"
        style={{
          border: "2.5px solid var(--color-ink)",
          boxShadow: "6px 6px 0 var(--color-ink)",
          borderRadius: "var(--radius-none)",
          maxWidth: "480px",
        }}
      >
        <p
          className="text-sm text-mono mb-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          // y2k signature
        </p>
        <p className="text-md" style={{ fontFamily: "var(--font-body)" }}>
          2.5px ink border + 6px offset shadow + flat corners. Body type is
          General Sans.
        </p>

        <div className="mt-md flex gap-sm">
          <span
            className="px-sm py-2xs text-xs"
            style={{
              background: "var(--color-cyber)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            CYBER
          </span>
          <span
            className="px-sm py-2xs text-xs"
            style={{
              background: "var(--color-magenta)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            MAGENTA
          </span>
          <span
            className="px-sm py-2xs text-xs"
            style={{
              background: "var(--color-acid)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            ACID
          </span>
        </div>
      </div>
    </main>
  );
}
