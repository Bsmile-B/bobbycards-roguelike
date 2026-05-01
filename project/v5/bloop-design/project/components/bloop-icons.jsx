// Bloop Icons — consistent 24px stroke icons
// All use currentColor so they inherit text color.

const Icon = ({ d, size = 24, fill, stroke = 2, children, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill || "none"} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
    {d && <path d={d} />}
    {children}
  </svg>
);

const BloopIcons = {
  // nav
  home: (p) => <Icon {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></Icon>,
  compass: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5 5.5-2z"/></Icon>,
  calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>,
  chat: (p) => <Icon {...p}><path d="M21 12c0 4.4-4 8-9 8a10 10 0 01-3.5-.6L3 21l1.3-4.1A7.8 7.8 0 013 12c0-4.4 4-8 9-8s9 3.6 9 8z"/></Icon>,
  user: (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Icon>,
  // actions
  search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>,
  plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  close: (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  chevronRight: (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  chevronLeft: (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  chevronDown: (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  arrowRight: (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  arrowUpRight: (p) => <Icon {...p}><path d="M7 17L17 7M8 7h9v9"/></Icon>,
  // objects
  pin: (p) => <Icon {...p}><path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></Icon>,
  bell: (p) => <Icon {...p}><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8M9 20a3 3 0 006 0"/></Icon>,
  clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  users: (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></Icon>,
  flame: (p) => <Icon {...p}><path d="M12 2s5 4 5 9a5 5 0 01-10 0c0-2 1-3 1-3s-1 4 2 4c0-4 2-6 2-10z"/></Icon>,
  sparkle: (p) => <Icon {...p}><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z"/></Icon>,
  filter: (p) => <Icon {...p}><path d="M4 5h16M7 12h10M10 19h4"/></Icon>,
  sliders: (p) => <Icon {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4"/></Icon>,
  map: (p) => <Icon {...p}><path d="M9 3l-6 2v16l6-2 6 2 6-2V3l-6 2-6-2z"/><path d="M9 3v16M15 5v16"/></Icon>,
  list: (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0"/></Icon>,
  heart: (p) => <Icon {...p}><path d="M12 21s-8-5-8-11a5 5 0 019-3 5 5 0 019 3c0 6-8 11-8 11z"/></Icon>,
  share: (p) => <Icon {...p}><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></Icon>,
  star: (p) => <Icon {...p}><path d="M12 2l3 6.5 7 1-5 5 1 7-6-3.5L6 21.5l1-7-5-5 7-1L12 2z"/></Icon>,
  check: (p) => <Icon {...p}><path d="M4 12l5 5L20 6"/></Icon>,
  lock: (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 118 0v4"/></Icon>,
  globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></Icon>,
  qr: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3v1"/></Icon>,
  settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 00-2-1.2L14 3h-4l-.5 2.5a7 7 0 00-2 1.2L5 5.8l-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-.9a7 7 0 002 1.2L10 21h4l.5-2.5a7 7 0 002-1.2l2.4.9 2-3.4-2-1.6A7 7 0 0019 12z"/></Icon>,
  camera: (p) => <Icon {...p}><path d="M3 8a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/><circle cx="12" cy="13" r="4"/></Icon>,
  image: (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></Icon>,
  mic: (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4"/></Icon>,
  send: (p) => <Icon {...p}><path d="M22 2L2 10l8 3 3 8L22 2z"/></Icon>,
  medal: (p) => <Icon {...p}><circle cx="12" cy="14" r="6"/><path d="M8 2l4 8 4-8M9 2h6"/></Icon>,
  trophy: (p) => <Icon {...p}><path d="M8 3h8v5a4 4 0 01-8 0V3zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M10 14h4v3h-4zM8 20h8"/></Icon>,
  zap: (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></Icon>,
  dot: (p) => <Icon size={8}><circle cx="4" cy="4" r="3" fill="currentColor"/></Icon>,
  more: (p) => <Icon {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></Icon>,
  verified: (p) => <Icon {...p}><path d="M12 2l2 2 3-.5 1 3 3 1-.5 3 2 2-2 2 .5 3-3 1-1 3-3-.5-2 2-2-2-3 .5-1-3-3-1 .5-3-2-2 2-2-.5-3 3-1 1-3 3 .5 2-2z"/><path d="M8.5 12l2.5 2.5L15.5 10"/></Icon>,
};

window.BloopIcons = BloopIcons;
window.Icon = Icon;
