interface Props {
  title: string;
  accentIndex?: number;
  height?: number | string;
  width?: string;
}

const GRADIENTS = [
  ["#4f35d2", "#8b74f0"],
  ["#f05a4f", "#f59e0b"],
  ["#0d9488", "#4f35d2"],
  ["#f59e0b", "#f05a4f"],
  ["#6b52e8", "#0d9488"],
  ["#f05a4f", "#6b52e8"],
];

const PATTERNS = [
  // Dots
  `<pattern id="p" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.15)"/></pattern>`,
  // Grid
  `<pattern id="p" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0M0 24V0" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" fill="none"/></pattern>`,
  // Diagonal lines
  `<pattern id="p" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 16L16 0" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/></pattern>`,
];

export default function DefaultCover({ title, accentIndex = 0, height = "100%", width = "100%" }: Props) {
  const idx = accentIndex % GRADIENTS.length;
  const [c1, c2] = GRADIENTS[idx];
  const pattern = PATTERNS[idx % PATTERNS.length];

  // Get initials (up to 2 chars)
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const gradId = `g${idx}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
        ${pattern}
      </defs>
      <rect width="800" height="450" fill="url(#${gradId})"/>
      <rect width="800" height="450" fill="url(#p)"/>
      <circle cx="400" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="400" cy="200" r="56" fill="rgba(255,255,255,0.12)"/>
      <text x="400" y="215" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="48" font-weight="800" fill="rgba(255,255,255,0.95)"
        letter-spacing="-1">${initials}</text>
      <text x="400" y="310" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="15" font-weight="500" fill="rgba(255,255,255,0.6)"
        letter-spacing="0.5">BLOGIFY</text>
    </svg>
  `.trim();

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUrl}
      alt={title}
      style={{ width, height, objectFit: "cover", display: "block" }}
    />
  );
}
