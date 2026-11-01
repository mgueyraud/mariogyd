"use client";

const LEVELS = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4];

type ZoomControlProps = {
  zoom: number;
  onChange: (zoom: number) => void;
};

/*
 * Canvas zoom, deliberately outside DialKit so it never ends up in copied
 * presets. Steps through fixed levels; the percentage resets to 100%.
 */
export default function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  const index = LEVELS.indexOf(zoom);
  const button =
    "grid size-8 place-items-center rounded-md text-[15px] leading-none hover:bg-(--chrome-hover) active:bg-(--chrome-active) disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label="Canvas zoom"
      className="flex items-center gap-0.5"
    >
      <button
        type="button"
        aria-label="Zoom out"
        disabled={index === 0}
        onClick={() => onChange(LEVELS[index - 1])}
        className={button}
      >
        −
      </button>
      <button
        type="button"
        aria-label="Reset zoom to 100%"
        onClick={() => onChange(1)}
        className="h-8 min-w-12 rounded-md px-1.5 text-[12px] leading-none tabular-nums hover:bg-(--chrome-hover) active:bg-(--chrome-active)"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        disabled={index === LEVELS.length - 1}
        onClick={() => onChange(LEVELS[index + 1])}
        className={button}
      >
        +
      </button>
    </div>
  );
}
