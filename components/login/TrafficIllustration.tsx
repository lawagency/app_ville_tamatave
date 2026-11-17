/** Illustration du suivi de la circulation à Toamasina : route, bajaj, feu tricolore, contrôle QR. */
export default function TrafficIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto"
      role="img"
      aria-label="Suivi de la circulation"
    >
      <path
        className="fill-primary/5"
        d="M50 200C30 110 130 35 245 45c115 10 210 70 195 165-15 95-110 125-215 115C120 315 70 290 50 200Z"
      />

      {[
        [40, 60],
        [455, 140],
        [150, 30],
        [30, 170],
        [395, 25],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="10"
          height="10"
          transform={`rotate(45 ${x + 5} ${y + 5})`}
          className="fill-none stroke-primary/30"
          strokeWidth="2"
        />
      ))}
      <circle cx="120" cy="45" r="3" className="fill-accent" />
      <circle cx="350" cy="40" r="4" className="fill-secondary/60" />
      <circle cx="465" cy="95" r="3" className="fill-primary/40" />

      {/* Itinéraire suivi */}
      <path
        d="M70 95C110 30 190 40 230 70s110 10 150-20 70-10 75 20"
        className="fill-none stroke-primary"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <path
        d="M70 70a14 14 0 0 1 14 14c0 11-14 24-14 24s-14-13-14-24a14 14 0 0 1 14-14Z"
        className="fill-danger"
      />
      <circle cx="70" cy="84" r="5" className="fill-surface" />
      <path
        d="M455 50a14 14 0 0 1 14 14c0 11-14 24-14 24s-14-13-14-24a14 14 0 0 1 14-14Z"
        className="fill-secondary"
      />
      <circle cx="455" cy="64" r="5" className="fill-surface" />

      {/* Mer : Toamasina, ville portuaire */}
      <path
        className="fill-primary/15"
        d="M0 310c40-12 80-12 120 0s80 12 120 0 80-12 120 0 80 12 120 0v50H0Z"
      />
      <path
        className="fill-primary/30"
        d="M0 330c40-10 80-10 120 0s80 10 120 0 80-10 120 0 80 10 120 0v30H0Z"
      />

      {/* Palmier */}
      <path
        d="M432 262c-4-40-10-75-2-110"
        className="fill-none stroke-text-muted"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse
        cx="408"
        cy="150"
        rx="28"
        ry="8"
        transform="rotate(25 408 150)"
        className="fill-secondary"
      />
      <ellipse
        cx="452"
        cy="150"
        rx="28"
        ry="8"
        transform="rotate(-25 452 150)"
        className="fill-secondary"
      />
      <ellipse
        cx="415"
        cy="138"
        rx="24"
        ry="7"
        transform="rotate(-20 415 138)"
        className="fill-secondary/80"
      />
      <ellipse
        cx="447"
        cy="136"
        rx="24"
        ry="7"
        transform="rotate(20 447 136)"
        className="fill-secondary/80"
      />
      <circle cx="430" cy="152" r="5" className="fill-accent" />

      {/* Route */}
      <rect x="10" y="248" width="460" height="46" rx="4" className="fill-text-main/85" />
      <line
        x1="20"
        y1="271"
        x2="460"
        y2="271"
        className="stroke-surface"
        strokeWidth="3"
        strokeDasharray="18 14"
      />

      {/* Feu tricolore */}
      <rect x="117" y="150" width="6" height="100" className="fill-text-main" />
      <rect x="104" y="98" width="32" height="72" rx="4" className="fill-primary" />
      <circle cx="120" cy="112" r="8" className="fill-danger" />
      <circle cx="120" cy="134" r="8" className="fill-accent/40" />
      <circle cx="120" cy="156" r="8" className="fill-secondary/40" />

      {/* Écran de contrôle avec QR code */}
      <rect x="170" y="95" width="150" height="110" rx="4" className="fill-primary" />
      <rect x="180" y="105" width="130" height="86" rx="2" className="fill-surface" />
      <rect x="235" y="205" width="20" height="20" className="fill-primary" />
      <rect x="212" y="222" width="66" height="6" rx="2" className="fill-primary" />

      <g className="fill-text-main">
        {[
          [190, 115],
          [222, 115],
          [190, 147],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="20" height="20" />
            <rect x={x + 4} y={y + 4} width="12" height="12" className="fill-surface" />
            <rect x={x + 7} y={y + 7} width="6" height="6" />
          </g>
        ))}
        {[
          [214, 115],
          [214, 127],
          [226, 147],
          [234, 155],
          [214, 159],
          [226, 163],
          [238, 143],
          [214, 143],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" />
        ))}
      </g>
      <line x1="186" y1="140" x2="248" y2="140" className="stroke-secondary" strokeWidth="2" />

      <rect x="258" y="118" width="42" height="6" rx="2" className="fill-border" />
      <rect x="258" y="130" width="30" height="6" rx="2" className="fill-border" />
      <rect x="258" y="142" width="36" height="6" rx="2" className="fill-border" />
      <rect x="258" y="160" width="42" height="14" rx="2" className="fill-secondary" />
      <path
        d="M272 167l4 4 8-8"
        className="fill-none stroke-surface"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Bouclier : sécurité */}
      <path d="M170 78l22 8v16c0 14-10 24-22 28-12-4-22-14-22-28V86Z" className="fill-secondary" />
      <path
        d="M160 104l7 7 13-13"
        className="fill-none stroke-surface"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bajaj (taxi tricycle) */}
      <rect x="318" y="198" width="54" height="9" rx="3" className="fill-primary" />
      <path d="M300 262v-28c2-18 12-26 26-27h34c18 1 26 12 30 30l4 25Z" className="fill-accent" />
      <path d="M316 234l4-16h30v16Z" className="fill-surface/85" />
      <path d="M356 218h14c6 2 10 8 12 16h-26Z" className="fill-surface/85" />
      <rect x="300" y="244" width="94" height="5" className="fill-primary/60" />
      <circle cx="318" cy="266" r="11" className="fill-text-main" />
      <circle cx="318" cy="266" r="4" className="fill-surface" />
      <circle cx="380" cy="266" r="11" className="fill-text-main" />
      <circle cx="380" cy="266" r="4" className="fill-surface" />
      <circle cx="392" cy="240" r="4" className="fill-accent/60" />
    </svg>
  );
}
