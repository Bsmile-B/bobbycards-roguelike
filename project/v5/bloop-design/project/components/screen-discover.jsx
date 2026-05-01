// Discover + Event Detail screens
const { BloopIcons: I2, BloopTokens: T2, BloopBtn: B2, EventCard: EC2, EventRow: ER2, CatPill: CP2, BloopGoo: BG2, cardStyle: cs2, MOCK_EVENTS: ME2, SectionHeader: SH2, MiniCard: MC2 } = window;

function DiscoverScreen({ cardVariant, setScreen }) {
  const [view, setView] = React.useState('list'); // list | map
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'Tout', emoji: '✨' },
    { id: 'near', label: 'Près', emoji: '📍' },
    { id: 'pop', label: 'Populaire', emoji: '🔥' },
    { id: 'new', label: 'Nouveau', emoji: '🆕' },
    { id: 'free', label: 'Gratuit', emoji: '💸' },
  ];
  return (
    <div style={{ minHeight: '100%', position: 'relative', overflow: 'hidden', background: T2.ink0 }}>{React.createElement(window.VibeBackdrop, { variant: 'discover' })}
      {/* header with goo */}
      <div style={{ position: 'relative', padding: '60px 20px 20px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><BG2 colors={[T2.blue, T2.orange]}/></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: T2.fontDisplay, fontSize: 48, color: T2.textHi, letterSpacing: -1, lineHeight: 1 }}>
            Découvre<span style={{ color: T2.orange }}>.</span>
          </div>
          <div style={{ marginTop: 8, color: T2.textMid, fontFamily: T2.fontSans, fontSize: 14 }}>
            42 events · <span style={{ fontFamily: T2.fontDisplay, color: T2.textHi }}>rayon de 5 km</span>
          </div>
          {/* search */}
          <div style={{
            marginTop: 18, ...cs2(cardVariant), padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <I2.search size={20} style={{ color: T2.blue }}/>
            <span style={{ flex: 1, color: T2.textLo, fontFamily: T2.fontSans, fontSize: 14 }}>Lieux, tags, #crampons...</span>
            <button style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', color: T2.textHi, fontFamily: T2.fontMono, fontSize: 11, letterSpacing: 0.5, cursor: 'pointer' }}>⌘K</button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ padding: '0 20px', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['list','map'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: view === v ? `linear-gradient(180deg, ${T2.blueStart}, ${T2.blue})` : 'transparent',
              color: view === v ? '#fff' : T2.textMid, fontFamily: T2.fontSans, fontWeight: 600, fontSize: 13,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: view === v ? '0 6px 16px rgba(0,108,255,0.3)' : 'none',
            }}>
              {v === 'list' ? <I2.list size={16}/> : <I2.map size={16}/>}
              {v === 'list' ? 'Liste' : 'Carte'}
            </button>
          ))}
        </div>
      </div>

      {/* filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 10px', overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: filter === f.id ? T2.textHi : 'rgba(255,255,255,0.06)',
            color: filter === f.id ? T2.ink0 : T2.textHi, fontFamily: T2.fontSans, fontWeight: 600, fontSize: 13,
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            border: filter === f.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
          }}>{f.emoji} {f.label}</button>
        ))}
      </div>

      {view === 'map' ? (
        <div style={{ padding: '0 20px 120px' }}>
          {/* fake map */}
          <div style={{ ...cs2(cardVariant), height: 360, padding: 0, position: 'relative', overflow: 'hidden' }}>
            <FakeMap/>
            {/* overlay legend */}
            <div style={{
              position: 'absolute', left: 14, top: 14, padding: '10px 14px', borderRadius: 14,
              background: 'rgba(10,11,16,0.7)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontFamily: T2.fontDisplay, fontSize: 18, color: T2.textHi, lineHeight: 1 }}>Paris</div>
              <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: T2.textLo, marginTop: 2, letterSpacing: 1 }}>42 EVENTS · 5 KM</div>
            </div>
            <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['＋','－','⊙'].map((s,i) => <button key={i} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(10,11,16,0.8)', backdropFilter:'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: T2.textHi, fontSize: 18, cursor: 'pointer' }}>{s}</button>)}
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SH2 title="Événements sur la carte" eyebrow={`6 résultats`}/>
            <div style={{ display:'flex', flexDirection:'column', gap: 10, marginTop: 14 }}>
              {ME2.slice(0, 4).map(e => <ER2 key={e.id} event={e} cardVariant={cardVariant} onClick={() => setScreen('event')}/>)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '10px 20px 120px' }}>
          {/* featured trending big card */}
          <div style={{ marginBottom: 20 }}>
            <EC2 event={ME2[1]} cardVariant={cardVariant} onClick={() => setScreen('event')}/>
          </div>
          {/* categories grid */}
          <SH2 title="Par catégorie" eyebrow="trouve ton truc"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
            {Object.entries(T2.cat).map(([k, c]) => (
              <div key={k} style={{
                aspectRatio: '1', borderRadius: 18, padding: 12,
                background: `linear-gradient(135deg, ${c.solid}, ${c.bg})`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 32 }}>{c.emoji}</div>
                <div>
                  <div style={{ fontFamily: T2.fontSans, fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>{k}</div>
                  <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{4 + k.length} events</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <SH2 title="Tous les events" eyebrow="ordre : pertinence"/>
            <div style={{ display:'flex', flexDirection:'column', gap: 14, marginTop: 14 }}>
              {ME2.slice(2).map(e => <EC2 key={e.id} event={e} cardVariant={cardVariant} onClick={() => setScreen('event')}/>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.DiscoverScreen = DiscoverScreen;

// Stylized map SVG
function FakeMap() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" style={{ background: '#0D1020' }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%"><stop offset="0%" stopColor={T2.blue} stopOpacity="0.4"/><stop offset="100%" stopColor={T2.blue} stopOpacity="0"/></radialGradient>
      </defs>
      {/* roads */}
      <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
        {Array.from({length: 20}).map((_, i) => <line key={i} x1="0" y1={i*20} x2="400" y2={i*20+30}/>)}
        {Array.from({length: 20}).map((_, i) => <line key={'v'+i} x1={i*22} y1="0" x2={i*22-20} y2="360"/>)}
      </g>
      {/* main roads */}
      <path d="M0,180 Q200,120 400,220" stroke={T2.blue} strokeOpacity="0.3" strokeWidth="3" fill="none"/>
      <path d="M40,0 L180,360" stroke={T2.orange} strokeOpacity="0.2" strokeWidth="3" fill="none"/>
      <path d="M400,100 Q200,240 0,300" stroke={T2.blue} strokeOpacity="0.2" strokeWidth="2" fill="none"/>
      {/* river */}
      <path d="M0,240 Q100,220 200,250 T400,240 L400,260 Q300,280 200,260 T0,260 Z" fill={T2.blue} fillOpacity="0.08"/>
      {/* user location */}
      <circle cx="180" cy="180" r="40" fill="url(#glow)"/>
      <circle cx="180" cy="180" r="10" fill={T2.blue}/>
      <circle cx="180" cy="180" r="14" fill="none" stroke={T2.blue} strokeOpacity="0.4" strokeWidth="2">
        <animate attributeName="r" values="14;30;14" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* event pins */}
      {[
        { x: 120, y: 120, cat: 'sport' },
        { x: 240, y: 90, cat: 'soiree' },
        { x: 280, y: 200, cat: 'apero' },
        { x: 110, y: 260, cat: 'culture' },
        { x: 320, y: 280, cat: 'food' },
        { x: 90, y: 180, cat: 'rando' },
      ].map((p, i) => {
        const c = T2.cat[p.cat];
        return (
          <g key={i} transform={`translate(${p.x},${p.y})`}>
            <circle r="18" fill={c.solid} opacity="0.15"/>
            <circle r="12" fill={c.solid} stroke="#fff" strokeWidth="2"/>
            <text textAnchor="middle" dy="4" fontSize="12">{c.emoji}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══ EVENT DETAIL ═══
function EventDetailScreen({ cardVariant, setScreen }) {
  const e = ME2[1]; // rooftop
  const c = T2.cat[e.cat];
  return (
    <div style={{ minHeight: '100%', position: 'relative', overflow: 'hidden', background: T2.ink0 }}>{React.createElement(window.VibeBackdrop, { variant: 'discover' })}
      {/* hero */}
      <div style={{ height: 380, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${c.solid}, ${c.bg})` }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}><BG2 colors={[c.solid, c.ink]}/></div>
        {/* back */}
        <button onClick={() => setScreen('discover')} style={{ position: 'absolute', top: 56, left: 20, width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}>
          <I2.chevronLeft size={22}/>
        </button>
        <div style={{ position: 'absolute', top: 56, right: 20, display: 'flex', gap: 8, zIndex: 5 }}>
          {[I2.share, I2.heart].map((Ic, i) => (
            <button key={i} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Ic size={18}/></button>
          ))}
        </div>
        {/* bottom content of hero */}
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, zIndex: 4 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <CP2 cat={e.cat} size="lg"/>
            <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', color: '#fff', fontFamily: T2.fontSans, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <I2.flame size={12}/> 14 sont déjà IN
            </div>
          </div>
          <div style={{ fontFamily: T2.fontDisplay, fontSize: 44, color: '#fff', letterSpacing: -1.2, lineHeight: 1, }}>
            {e.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'rgba(255,255,255,0.85)', fontFamily: T2.fontSans, fontSize: 14 }}>
            <I2.pin size={16}/> {e.place} · {e.distance}
          </div>
        </div>
        {/* fade */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, background: `linear-gradient(180deg, transparent, ${T2.ink0})` }}/>
      </div>

      {/* body */}
      <div style={{ padding: '8px 20px 120px' }}>
        {/* countdown */}
        <div style={{ ...cs2(cardVariant), padding: 18, marginBottom: 18 }}>
          <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: T2.textLo, textTransform: 'uppercase', letterSpacing: 1.5 }}>Commence dans</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[['02','j'],['14','h'],['32','min'],['09','s']].map(([n, u], i) => (
              <div key={i} style={{ flex: 1, padding: '12px 0', borderRadius: 14, background: 'rgba(255,255,255,0.04)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: T2.fontDisplay, fontSize: 32, color: T2.textHi, letterSpacing: -1, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: T2.textLo, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{u}</div>
              </div>
            ))}
          </div>
        </div>

        {/* host */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: T2.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative' }}>
            👩
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, background: T2.blue, border: `2px solid ${T2.ink0}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I2.verified size={12} style={{ color: '#fff' }}/>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: T2.textLo, textTransform: 'uppercase', letterSpacing: 1 }}>Organisé par</div>
            <div style={{ fontFamily: T2.fontSans, fontSize: 15, color: T2.textHi, fontWeight: 600 }}>Julie M. <span style={{ fontWeight: 400, color: T2.textLo, fontSize: 12 }}>· 12 events créés</span></div>
          </div>
          <button style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: T2.textHi, fontFamily: T2.fontSans, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>+ Suivre</button>
        </div>

        {/* desc */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: T2.fontDisplay, fontSize: 22, color: T2.textHi, letterSpacing: -0.4, marginBottom: 8 }}>À propos</div>
          <div style={{ fontFamily: T2.fontSans, fontSize: 14, lineHeight: 1.6, color: T2.textMid }}>{e.description} Dress-code casual chic, on prend de la hauteur et on profite du spot le plus instagrammable de Paris.</div>
        </div>

        {/* meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {[
            { icon: I2.clock, label: 'Début', val: 'Ven 21, 20h' },
            { icon: I2.clock, label: 'Durée', val: '~3 heures' },
            { icon: I2.users, label: 'Places', val: '14 / 20' },
            { icon: I2.globe, label: 'Type', val: 'Public' },
          ].map((m, i) => (
            <div key={i} style={{ ...cs2(cardVariant), padding: 14 }}>
              <m.icon size={16} style={{ color: T2.blue, marginBottom: 8 }}/>
              <div style={{ fontFamily: T2.fontMono, fontSize: 10, color: T2.textLo, textTransform: 'uppercase', letterSpacing: 1 }}>{m.label}</div>
              <div style={{ fontFamily: T2.fontSans, fontSize: 14, color: T2.textHi, fontWeight: 600, marginTop: 2 }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* participants */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: T2.fontDisplay, fontSize: 22, color: T2.textHi, letterSpacing: -0.4 }}>Ils seront là</div>
            <span style={{ fontFamily: T2.fontMono, fontSize: 11, color: T2.textLo, letterSpacing: 0.5 }}>14 / 20</span>
          </div>
          <div style={{ ...cs2(cardVariant), padding: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['👩','👨','👩‍🦱','🧔','👩‍🦰','🧑‍🦲','👱','🧑','👨‍🦳','👩‍🦳','🧑‍🦱','🧑‍🎤'].map((em, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: 20, background: `hsl(${i*30}, 65%, 55%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 20 }}>{em}</div>
              ))}
              <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: T2.fontSans, fontSize: 12, fontWeight: 600, color: T2.textHi }}>+2</div>
            </div>
          </div>
        </div>

        {/* map preview */}
        <div style={{ ...cs2(cardVariant), padding: 0, marginBottom: 22, overflow: 'hidden', height: 180 }}>
          <FakeMap/>
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 20px 28px', background: 'linear-gradient(180deg, rgba(10,11,16,0), rgba(10,11,16,0.98) 40%)', zIndex: 30 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: T2.textHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I2.chat size={22}/>
          </button>
          <B2 full size="lg" variant="orange" icon={<I2.sparkle size={18}/>}>Je rejoins · C'est parti</B2>
        </div>
      </div>
    </div>
  );
}
window.EventDetailScreen = EventDetailScreen;
