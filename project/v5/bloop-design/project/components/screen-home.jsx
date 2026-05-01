// Bloop screens — Home, Discover, Social, Profile, MyEvents, EventDetail, Create, Auth
const { BloopIcons: I, BloopTokens: T, BloopBtn, BloopNav, StatusBar, EventCard, EventRow, CatPill, BloopBlob, BloopGoo, VibeBackdrop, cardStyle, MOCK_EVENTS, MOCK_FRIENDS, MOCK_BADGES } = window;

const screenPad = { padding: '60px 20px 120px' };

// ═══ HOME ═══
function HomeScreen({ cardVariant, setScreen }) {
  return (
    <div style={{ ...screenPad, position: 'relative', minHeight: '100%', overflow: 'hidden' }}>
      <VibeBackdrop variant="home"/>
      {/* animated blob bg — legacy, hidden */}
      <div style={{ display: 'none' }}>
        <BloopGoo colors={[T.blue, T.orange]} />
      </div>

      {/* header */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,106,0,0.18)', border: '1px solid rgba(255,106,0,0.4)', marginBottom: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: T.orange, boxShadow: `0 0 6px ${T.orange}` }}/>
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.orange, letterSpacing: 0.5 }}>42 POTES EN LIGNE</span>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 46, lineHeight: 0.95, color: T.textHi, letterSpacing: -2, fontWeight: 700 }}>
            hey alex <span style={{ fontSize: 38 }}>👋</span>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 44, lineHeight: 0.95, color: T.textMid, letterSpacing: -2, fontWeight: 400, marginTop: 2 }}>
            ça bouge <span style={{ color: T.orange }}>fort</span> ce soir
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: T.textHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I.bell size={20}/>
          </button>
          <button style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${T.orangeStart}, ${T.orange})`, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18,
            boxShadow: '0 6px 18px rgba(255,106,0,0.4)', fontFamily: T.fontSans,
          }}>A</button>
        </div>
      </div>

      {/* streak + XP widget */}
      <div style={{ ...cardStyle(cardVariant), padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, #FFA14E, ${T.orange})`, fontSize: 28, boxShadow: '0 6px 18px rgba(255,106,0,0.35)' }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.textHi, letterSpacing: -0.5 }}>7</span>
            <span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.textMid, textTransform: 'uppercase', letterSpacing: 1 }}>jours de streak</span>
          </div>
          <div style={{ marginTop: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${T.orangeStart}, ${T.orange})` }}/>
          </div>
          <div style={{ marginTop: 5, fontSize: 11, color: T.textLo, fontFamily: T.fontMono, letterSpacing: 0.3 }}>+ 240 XP · 60 XP pour le prochain badge</div>
        </div>
      </div>

      {/* search */}
      <div style={{
        ...cardStyle(cardVariant), padding: '14px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <I.search size={20} style={{ color: T.blue }}/>
        <span style={{ flex: 1, color: T.textLo, fontFamily: T.fontSans, fontSize: 15 }}>Un lieu, un event, une vibe...</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,108,255,0.15)', color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.sliders size={16}/>
        </div>
      </div>

      {/* Near you */}
      <SectionHeader icon={<I.pin size={18} style={{ color: T.orange }}/>} title="Près de vous" eyebrow="3 events à moins d'1 km" action="Voir tout"/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
        <EventCard event={MOCK_EVENTS[3]} cardVariant={cardVariant} onClick={() => setScreen('event')}/>
        <EventCard event={MOCK_EVENTS[0]} cardVariant={cardVariant} onClick={() => setScreen('event')}/>
      </div>

      {/* Section: Trending */}
      <div style={{ marginTop: 32 }}>
        <SectionHeader icon={<I.flame size={18} style={{ color: T.orange }}/>} title="Ça bouge ce weekend" eyebrow="curated pour toi" action="Tout voir"/>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', marginTop: 14, padding: '4px 0 20px', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          {[MOCK_EVENTS[1], MOCK_EVENTS[2], MOCK_EVENTS[5]].map(e => (
            <div key={e.id} style={{ flexShrink: 0, width: 230 }}>
              <MiniCard event={e} cardVariant={cardVariant} onClick={() => setScreen('event')}/>
            </div>
          ))}
        </div>
      </div>

      {/* Friends active */}
      <div style={{ marginTop: 16 }}>
        <SectionHeader icon={<I.sparkle size={18} style={{ color: T.blue }}/>} title="Les potes bougent"/>
        <div style={{ ...cardStyle(cardVariant), padding: 16, marginTop: 14 }}>
          {MOCK_FRIENDS.slice(0,3).map((f, i) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: f.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative' }}>
                {f.emoji}
                {f.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, background: '#1DB954', border: '2px solid ' + T.ink1 }}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: T.textHi, fontFamily: T.fontSans, fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                <div style={{ color: T.textLo, fontSize: 12, fontFamily: T.fontSans }}>
                  {i === 0 ? 'vient de rejoindre un apéro' : i === 1 ? 'a créé "Rando dimanche"' : 'est à 200m de toi 📍'}
                </div>
              </div>
              <button style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: T.textHi, fontSize: 12, fontFamily: T.fontSans, fontWeight: 600, cursor: 'pointer' }}>Voir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.HomeScreen = HomeScreen;

function SectionHeader({ icon, title, eyebrow, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span style={{ fontFamily: T.fontDisplay, fontSize: 26, color: T.textHi, letterSpacing: -0.5 }}>{title}</span>
        </div>
        {eyebrow && <div style={{ color: T.textLo, fontFamily: T.fontMono, fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{eyebrow}</div>}
      </div>
      {action && <button style={{ background: 'transparent', border: 'none', color: T.blue, fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{action}</button>}
    </div>
  );
}
window.SectionHeader = SectionHeader;

function MiniCard({ event, cardVariant, onClick }) {
  const c = T.cat[event.cat];
  return (
    <div onClick={onClick} style={{ ...cardStyle(cardVariant), cursor: 'pointer' }}>
      <div style={{ height: 120, background: `linear-gradient(135deg, ${c.solid}, ${c.bg})`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><BloopGoo colors={[c.solid, c.ink]}/></div>
        <div style={{ position: 'absolute', top: 10, left: 10 }}><CatPill cat={event.cat}/></div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, color: '#fff', fontFamily: T.fontMono, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{event.dateLabel} · {event.time}</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 18, color: T.textHi, lineHeight: 1.15, letterSpacing: -0.3, height: 42, overflow: 'hidden' }}>{event.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ color: T.textLo, fontSize: 11, fontFamily: T.fontSans }}>{event.place}</span>
          <span style={{ color: T.textHi, fontSize: 11, fontFamily: T.fontMono }}>{event.count}/{event.max}</span>
        </div>
      </div>
    </div>
  );
}
window.MiniCard = MiniCard;
