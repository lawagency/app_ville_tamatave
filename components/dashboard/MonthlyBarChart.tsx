"use client";

import { useState } from "react";

export type BarDatum = {
  label: string;
  value: number;
};

/** Arrondit le maximum à un multiple de 4 pour avoir des graduations entières. */
function niceMax(value: number) {
  return Math.max(4, Math.ceil(value / 4) * 4);
}

export default function MonthlyBarChart({ data, unit }: { data: BarDatum[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="flex gap-3">
      <div className="relative h-56 w-8 text-right text-xs text-text-muted">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute right-0 translate-y-1/2"
            style={{ bottom: `${t * 100}%` }}
          >
            {max * t}
          </span>
        ))}
      </div>

      <div className="flex-1">
        <div className="relative h-56 border-b border-border">
          {ticks.slice(1).map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-border"
              style={{ bottom: `${t * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.label}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="relative flex h-full flex-1 items-end justify-center"
              >
                <div
                  className={`w-1/2 max-w-8 rounded-t-sm transition-colors ${
                    hover === i ? "bg-primary-hover" : "bg-primary"
                  }`}
                  style={{ height: `${(d.value / max) * 100}%` }}
                />
                {hover === i && (
                  <div
                    className="pointer-events-none absolute z-10 -translate-y-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white dark:bg-slate-700 shadow"
                    style={{ bottom: `${(d.value / max) * 100}%` }}
                  >
                    <span className="font-semibold">{d.value}</span> {unit} · {d.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex">
          {data.map((d) => (
            <span key={d.label} className="flex-1 text-center text-xs text-text-muted">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
