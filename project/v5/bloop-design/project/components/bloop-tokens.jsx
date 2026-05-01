// Bloop design tokens — single source of truth for the redesign.

const BloopTokens = {
  // core palette (from CHARTE_GRAPHIQUE_BLOOP.md)
  blueStart: '#5C9AD6',
  blue: '#006CFF',
  blueHover: '#045DE9',
  orangeStart: '#FFA14E',
  orange: '#FF6A00',
  orangeHover: '#FF8400',

  // elevated ink palette (our "premium" extension)
  ink0: '#0A0B10',    // page background
  ink1: '#0F1118',    // card base
  ink2: '#171926',    // card elevated
  ink3: '#232638',    // border
  inkLine: 'rgba(255,255,255,0.08)',

  // text on dark
  textHi: '#FFFFFF',
  textMid: 'rgba(255,255,255,0.72)',
  textLo: 'rgba(255,255,255,0.48)',
  textMicro: 'rgba(255,255,255,0.32)',

  // light
  paper: '#FAFAF7',
  paperDeep: '#F3F1EC',
  inkOnPaper: '#0A0B10',
  inkOnPaperMid: 'rgba(10,11,16,0.62)',
  inkOnPaperLo: 'rgba(10,11,16,0.36)',

  // category hues (for event pills + cards)
  cat: {
    sport:   { bg: '#0E3B1F', solid: '#1DB954', soft: '#D4F5DE', ink: '#0B2614', emoji: '⚽' },
    soiree:  { bg: '#3C1558', solid: '#B65CFF', soft: '#EBD9FF', ink: '#2A0B42', emoji: '🪩' },
    rando:   { bg: '#1E3A1C', solid: '#7FB83E', soft: '#E2F0D0', ink: '#14260F', emoji: '🥾' },
    apero:   { bg: '#4A2A0A', solid: '#FF8D3F', soft: '#FFE3CF', ink: '#351C05', emoji: '🥂' },
    culture: { bg: '#1C2C55', solid: '#6AA1FF', soft: '#D6E4FF', ink: '#0D1B3C', emoji: '🎭' },
    food:    { bg: '#4A0A1F', solid: '#FF4D6D', soft: '#FFD6DE', ink: '#35081A', emoji: '🍝' },
  },

  // font stacks — refreshed for Gen Z vibes
  fontDisplay: '"Space Grotesk", "Geist", -apple-system, system-ui, sans-serif',
  fontSans: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  fontMono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
  // extra vibes
  lime: '#C3F53C',
  violet: '#B65CFF',
  pink: '#FF4D8F',
  cyan: '#3FE0E8',

  // motion
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

window.BloopTokens = BloopTokens;

// Liquid blob SVG — our signature motif
function BloopBlob({ color = '#006CFF', size = 120, seed = 0, opacity = 1, style = {} }) {
  // morph anim paths keyed off seed
  const paths = [
    "M44.2,-66.1C56.9,-58.4,66.4,-44.4,71.5,-29.1C76.6,-13.8,77.3,2.9,71.9,17.3C66.5,31.7,55,43.7,41.7,52.9C28.3,62.1,13.1,68.4,-2.7,71.9C-18.5,75.4,-34.9,76,-47.8,68.6C-60.7,61.1,-70,45.6,-73.7,29.4C-77.4,13.2,-75.4,-3.7,-69.5,-18.1C-63.5,-32.5,-53.6,-44.5,-41.4,-53C-29.2,-61.5,-14.6,-66.6,0.7,-67.6C16,-68.7,32,-65.7,44.2,-58.1Z",
    "M38.7,-58.9C51.8,-52.1,65.8,-44.4,72.4,-32.7C79,-21,78.2,-5.3,74.1,8.8C70,22.9,62.6,35.4,52.3,45.3C42,55.3,28.8,62.7,13.9,67.5C-0.9,72.3,-17.3,74.5,-31,69.4C-44.7,64.3,-55.6,51.9,-62.3,38C-69,24,-71.5,8.5,-69.1,-5.7C-66.8,-19.9,-59.5,-32.8,-49.2,-41.1C-38.8,-49.4,-25.5,-53.1,-12.2,-56C1.1,-58.9,25.7,-65.7,38.7,-58.9Z",
    "M35.2,-51.8C46.5,-43.1,57,-34.1,63.8,-22.4C70.5,-10.7,73.5,3.7,70.4,16.8C67.3,29.9,58.1,41.7,46.4,50.4C34.7,59.1,20.5,64.7,5.2,66.4C-10.2,68.1,-26.6,65.9,-39.1,57.9C-51.6,50,-60.2,36.2,-65.1,21.3C-70,6.4,-71.3,-9.6,-66.5,-23.4C-61.7,-37.1,-50.9,-48.6,-38.1,-57C-25.3,-65.4,-10.5,-70.7,1.6,-73C13.7,-75.3,24,-60.5,35.2,-51.8Z"
  ];
  const id = `blob-${seed}-${Math.floor(Math.random()*1e6)}`;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ ...style, pointerEvents: 'none' }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur stdDeviation="0.4"/>
        </filter>
      </defs>
      <path filter={`url(#${id})`} fill={color} fillOpacity={opacity} d={paths[seed % paths.length]}>
        <animate attributeName="d" dur={`${8 + seed * 1.3}s`} repeatCount="indefinite"
          values={`${paths[seed%3]};${paths[(seed+1)%3]};${paths[(seed+2)%3]};${paths[seed%3]}`} />
      </path>
    </svg>
  );
}
window.BloopBlob = BloopBlob;

// Animated gooey multi-blob — for big decorative areas
function BloopGoo({ colors = ['#006CFF', '#FF6A00'], style = {} }) {
  const id = React.useMemo(() => `goo-${Math.floor(Math.random()*1e9)}`, []);
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset: 0, ...style }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11" result="goo"/>
          <feBlend in="SourceGraphic" in2="goo"/>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <circle cx="120" cy="140" r="80" fill={colors[0]}>
          <animate attributeName="cx" values="120;280;180;120" dur="14s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="140;200;120;140" dur="17s" repeatCount="indefinite"/>
        </circle>
        <circle cx="280" cy="260" r="100" fill={colors[1]}>
          <animate attributeName="cx" values="280;140;320;280" dur="16s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="260;180;280;260" dur="13s" repeatCount="indefinite"/>
        </circle>
        <circle cx="200" cy="120" r="60" fill={colors[0]} opacity="0.8">
          <animate attributeName="r" values="60;90;60" dur="9s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="200;260;160;200" dur="12s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}
window.BloopGoo = BloopGoo;

// Vibe backdrop — big, colorful, animated. Fills the screen behind content.
function VibeBackdrop({ variant = 'home', style = {} }) {
  const id = React.useMemo(() => `vibe-${Math.floor(Math.random()*1e9)}`, []);
  const palettes = {
    // blue + orange = identity. Accents are secondary and used sparingly.
    home:     ['#006CFF', '#FF6A00', '#FF4D8F', '#006CFF'],
    discover: ['#FF6A00', '#006CFF', '#B65CFF', '#FF6A00'],
    social:   ['#006CFF', '#FF6A00', '#3FE0E8', '#006CFF'],
    profile:  ['#FF6A00', '#006CFF', '#FF4D8F', '#FF6A00'],
    events:   ['#006CFF', '#FF6A00', '#006CFF', '#B65CFF'],
    create:   ['#FF6A00', '#006CFF', '#C3F53C', '#FF6A00'],
    auth:     ['#FF6A00', '#006CFF', '#FF4D8F', '#006CFF'],
  };
  const colors = palettes[variant] || palettes.home;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {/* base tint */}
      <div style={{ position: 'absolute', inset: 0, background: '#0A0B10' }}/>
      {/* colored gradient wash — saturated */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 140% 80% at 15% 0%, ${colors[0]}88, transparent 55%), radial-gradient(ellipse 120% 70% at 95% 20%, ${colors[1]}88, transparent 55%), radial-gradient(ellipse 120% 70% at 50% 100%, ${colors[2]}55, transparent 60%)` }}/>
      {/* gooey animated blobs */}
      <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id={id}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="40"/>
          </filter>
        </defs>
        <g filter={`url(#${id})`} opacity="0.85">
          <circle cx="80" cy="120" r="110" fill={colors[0]}>
            <animate attributeName="cx" values="80;260;140;80" dur="18s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="120;80;200;120" dur="21s" repeatCount="indefinite"/>
          </circle>
          <circle cx="320" cy="200" r="140" fill={colors[1]}>
            <animate attributeName="cx" values="320;120;280;320" dur="20s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="200;320;120;200" dur="17s" repeatCount="indefinite"/>
          </circle>
          <circle cx="200" cy="520" r="160" fill={colors[2]}>
            <animate attributeName="cx" values="200;80;340;200" dur="23s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="520;620;450;520" dur="19s" repeatCount="indefinite"/>
          </circle>
          <circle cx="120" cy="720" r="120" fill={colors[3]}>
            <animate attributeName="cx" values="120;300;180;120" dur="22s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="720;680;780;720" dur="25s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
      {/* subtle grain / darkening for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,16,0.2) 0%, rgba(10,11,16,0.55) 70%, rgba(10,11,16,0.85) 100%)' }}/>
      {/* noise */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")` }}/>
    </div>
  );
}
window.VibeBackdrop = VibeBackdrop;
