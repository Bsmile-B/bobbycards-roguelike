// Bloop shared UI primitives — cards, buttons, nav, category pills, badges
const { BloopIcons: I, BloopTokens: T, BloopBlob, BloopGoo } = window;

// ─── Card style variants (wired to Tweaks) ───
function cardStyle(variant) {
  const base = { borderRadius: 22, position: 'relative', overflow: 'hidden' };
  if (variant === 'glass') return { ...base,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
  };
  if (variant === 'embossed') return { ...base,
    background: `linear-gradient(180deg, ${T.ink2} 0%, ${T.ink1} 100%)`,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 12px 24px rgba(0,0,0,0.25)',
  };
  // flat
  return { ...base,
    background: T.ink1,
    border: '1px solid rgba(255,255,255,0.06)',
  };
}
window.cardStyle = cardStyle;

// ─── Category pill with emoji + color ───
function CatPill({ cat, size = 'sm' }) {
  const c = T.cat[cat] || T.cat.sport;
  const name = { sport:'Sport', soiree:'Soirée', rando:'Rando', apero:'Apéro', culture:'Culture', food:'Food' }[cat] || cat;
  const isLg = size === 'lg';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: isLg ? '8px 14px' : '5px 10px',
      borderRadius: 999, background: c.bg, color: c.solid,
      fontFamily: T.fontSans, fontSize: isLg ? 13 : 11, fontWeight: 600,
      letterSpacing: 0.2,
    }}>
      <span style={{ fontSize: isLg ? 15 : 13 }}>{c.emoji}</span>
      <span style={{ textTransform: 'uppercase' }}>{name}</span>
    </div>
  );
}
window.CatPill = CatPill;

// ─── Primary button (bleu gradient) ───
function BloopBtn({ children, onClick, variant = 'primary', full, icon, size = 'md', style = {} }) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
  const fs = size === 'lg' ? 17 : size === 'sm' ? 13 : 15;
  const bg = variant === 'primary'
    ? `linear-gradient(180deg, ${T.blueStart} 0%, ${T.blue} 100%)`
    : variant === 'orange'
    ? `linear-gradient(180deg, ${T.orangeStart} 0%, ${T.orange} 100%)`
    : variant === 'ghost' ? 'rgba(255,255,255,0.06)'
    : variant === 'dark' ? T.ink2
    : T.ink2;
  const color = variant === 'ghost' ? T.textHi : '#fff';
  const shadow = variant === 'primary' ? `0 8px 24px rgba(0,108,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`
    : variant === 'orange' ? `0 8px 24px rgba(255,106,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`
    : 'inset 0 1px 0 rgba(255,255,255,0.05)';
  return (
    <button onClick={onClick} style={{
      height: h, width: full ? '100%' : undefined,
      padding: `0 ${size === 'lg' ? 28 : 20}px`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      border: 'none', borderRadius: 16, cursor: 'pointer',
      background: bg, color, fontFamily: T.fontSans, fontWeight: 600, fontSize: fs,
      letterSpacing: -0.1, boxShadow: shadow,
      transition: 'transform 0.15s ' + T.spring,
      ...style,
    }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
       onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
       onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon}{children}
    </button>
  );
}
window.BloopBtn = BloopBtn;

// ─── Bottom nav (tabs) ───
function BloopNav({ active, onChange }) {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: I.home },
    { id: 'discover', label: 'Découvrir', icon: I.compass },
    { id: 'create', label: '', icon: I.plus, primary: true },
    { id: 'social', label: 'Social', icon: I.chat },
    { id: 'profile', label: 'Profil', icon: I.user },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      padding: '10px 14px 28px',
      background: 'linear-gradient(180deg, rgba(10,11,16,0) 0%, rgba(10,11,16,0.8) 40%, rgba(10,11,16,0.98) 100%)',
    }}>
      <div style={{
        height: 68, borderRadius: 26,
        background: 'rgba(23,25,38,0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 8px',
      }}>
        {tabs.map(t => {
          if (t.primary) return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              width: 52, height: 52, borderRadius: 18, border: 'none', cursor: 'pointer',
              background: `linear-gradient(180deg, ${T.orangeStart} 0%, ${T.orange} 100%)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(255,106,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
              transform: active === t.id ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.2s ' + T.spring,
            }}>
              <t.icon size={24} stroke={2.5}/>
            </button>
          );
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: isActive ? T.textHi : T.textLo,
              fontFamily: T.fontSans, fontSize: 10, fontWeight: 600,
              padding: '6px 8px', minWidth: 52,
              transition: 'color 0.2s',
            }}>
              <div style={{ position: 'relative' }}>
                <t.icon size={22} stroke={isActive ? 2.4 : 1.9}/>
                {isActive && <div style={{
                  position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: 2, background: T.blue,
                  boxShadow: `0 0 8px ${T.blue}`,
                }}/>}
              </div>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.BloopNav = BloopNav;

// ─── Status bar (simplified, dark) ───
function StatusBar({ dark = true }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px 0', zIndex: 30, pointerEvents: 'none',
    }}>
      <span style={{ fontFamily: T.fontSans, fontWeight: 600, fontSize: 15, color: c }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke={c} strokeOpacity="0.5" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill={c}/></svg>
      </div>
    </div>
  );
}
window.StatusBar = StatusBar;

// ─── Event card (big, horizontal) ───
function EventCard({ event, cardVariant = 'flat', onClick }) {
  const c = T.cat[event.cat];
  return (
    <div onClick={onClick} style={{
      ...cardStyle(cardVariant),
      padding: 0, cursor: 'pointer',
      transition: 'transform 0.2s ' + T.spring,
    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      {/* colored hero band */}
      <div style={{
        height: 132, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${c.solid} 0%, ${c.bg} 100%)`,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <BloopGoo colors={[c.solid, c.ink]} />
        </div>
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
          <CatPill cat={event.cat}/>
          {event.trending && <div style={{
            padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            backdropFilter: 'blur(12px)', display: 'inline-flex', gap: 4, alignItems: 'center',
          }}><I.flame size={12}/> TRENDING</div>}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><I.heart size={18}/></div>
        </div>
        {/* floating date badge */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          padding: '8px 14px', borderRadius: 14,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
          color: '#fff', fontFamily: T.fontMono, fontSize: 11, fontWeight: 500,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, lineHeight: 1.1,
        }}>
          <span style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>{event.dateLabel}</span>
          <span style={{ fontSize: 18, fontFamily: T.fontDisplay, fontWeight: 400 }}>{event.time}</span>
        </div>
      </div>
      {/* body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 24, lineHeight: 1.1, color: T.textHi, letterSpacing: -0.3 }}>
          {event.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: T.textMid, fontSize: 13, fontFamily: T.fontSans }}>
          <I.pin size={14}/>
          <span>{event.place}</span>
          <span style={{ opacity: 0.5, margin: '0 4px' }}>·</span>
          <span>{event.distance}</span>
        </div>
        {/* participants + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {event.avatars.slice(0,3).map((a,i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: 13, border: `2px solid ${cardVariant === 'glass' ? 'rgba(0,0,0,0.3)' : T.ink1}`,
                  marginLeft: i === 0 ? 0 : -9, background: a, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 11, color: '#fff', fontWeight: 600, fontFamily: T.fontSans,
                }}>{String.fromCharCode(65 + i)}</div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: T.textMid, fontFamily: T.fontSans }}>
              <span style={{ color: T.textHi, fontWeight: 600 }}>{event.count}</span> / {event.max}
            </span>
          </div>
          <button style={{
            height: 34, padding: '0 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: `linear-gradient(180deg, ${T.blueStart}, ${T.blue})`, color: '#fff',
            fontFamily: T.fontSans, fontWeight: 600, fontSize: 13,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            boxShadow: '0 4px 12px rgba(0,108,255,0.3)',
          }}>Rejoindre <I.arrowRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}
window.EventCard = EventCard;

// ─── Compact event row (list view) ───
function EventRow({ event, cardVariant = 'flat', onClick }) {
  const c = T.cat[event.cat];
  return (
    <div onClick={onClick} style={{ ...cardStyle(cardVariant), padding: 12, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{
        width: 58, height: 58, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, ${c.solid}, ${c.bg})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
      }}>{c.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontSans, fontWeight: 600, fontSize: 15, color: T.textHi, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: T.textLo, fontFamily: T.fontSans }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><I.clock size={11}/> {event.dateLabel} · {event.time}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><I.users size={11}/> {event.count}/{event.max}</span>
        </div>
      </div>
      <I.chevronRight size={18} style={{ color: T.textLo }}/>
    </div>
  );
}
window.EventRow = EventRow;
