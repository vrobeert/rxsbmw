const svgData = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const avatarPlaceholder = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="80" fill="#1C69D4"/>
      <circle cx="188" cy="48" r="50" fill="#ffffff" opacity="0.14"/>
      <text x="120" y="136" text-anchor="middle" fill="#fff" font-family="Inter, Arial" font-size="64" font-weight="800">${initials || "BH"}</text>
    </svg>
  `);
};

export const carPlaceholder = (label: string) =>
  svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#08080b"/>
          <stop offset="0.55" stop-color="#163f7a"/>
          <stop offset="1" stop-color="#111117"/>
        </linearGradient>
        <linearGradient id="car" x1="0" x2="1">
          <stop offset="0" stop-color="#5b6472"/>
          <stop offset="1" stop-color="#1C69D4"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#bg)"/>
      <ellipse cx="600" cy="604" rx="420" ry="56" fill="#000" opacity="0.55"/>
      <path d="M214 466c35-94 113-137 236-143l66-78c24-29 55-44 93-44h147c37 0 68 14 94 42l91 97c78 13 128 52 150 126l-47 71H253z" fill="url(#car)"/>
      <path d="M480 324l54-66c15-18 35-27 59-27h131c25 0 46 9 63 28l63 70z" fill="#0b0b10" opacity="0.84"/>
      <circle cx="421" cy="535" r="74" fill="#09090d" stroke="#24242d" stroke-width="24"/>
      <circle cx="822" cy="535" r="74" fill="#09090d" stroke="#24242d" stroke-width="24"/>
      <text x="70" y="105" fill="#fff" font-family="Inter, Arial" font-size="58" font-weight="800">${label}</text>
      <text x="72" y="158" fill="#d8d8e4" font-family="Inter, Arial" font-size="28" font-weight="500">BavarianHub garage</text>
    </svg>
  `);

export const eventPlaceholder = (label: string, city: string) =>
  svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#08080b"/>
          <stop offset="0.55" stop-color="#163f7a"/>
          <stop offset="1" stop-color="#101016"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#g)"/>
      <path d="M0 545c148-72 287-92 416-61 112 28 208 84 325 80 122-4 264-73 459-49v245H0z" fill="#050507" opacity="0.78"/>
      <path d="M136 506c80-116 181-174 303-174h328c125 0 224 58 297 174" fill="none" stroke="#fff" stroke-width="18" opacity="0.32"/>
      <text x="72" y="132" fill="#fff" font-family="Inter, Arial" font-size="64" font-weight="850">${label}</text>
      <text x="76" y="190" fill="#e8e8f4" font-family="Inter, Arial" font-size="32">${city}</text>
    </svg>
  `);
