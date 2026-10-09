type Props = { items: string[] };

/** Dot-matrix LED scroller, like the ones hanging in the store window. */
export function LedTicker({ items }: Props) {
  const line = items.map((t) => t.toUpperCase());
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {line.map((text, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span>{text}</span>
          <span className="inline-block size-1.5 rounded-full bg-sign/70" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="group relative overflow-hidden border-b border-white/5 bg-[#060606] py-1.5 font-led text-[0.95rem] font-black tracking-[0.12em] text-sign"
      style={{
        backgroundImage: "radial-gradient(rgba(255,204,41,0.07) 1px, transparent 1.2px)",
        backgroundSize: "4px 4px",
        textShadow: "0 0 8px rgba(255,204,41,0.55)",
      }}
    >
      <p className="sr-only">{items.join(" · ")}</p>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
