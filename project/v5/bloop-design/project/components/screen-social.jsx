// Social, Profile, MyEvents, Create, Auth screens
const { BloopIcons: I3, BloopTokens: T3, BloopBtn: B3, EventCard: EC3, EventRow: ER3, CatPill: CP3, BloopGoo: BG3, cardStyle: cs3, MOCK_EVENTS: ME3, MOCK_FRIENDS: MF3, MOCK_BADGES: MB3, SectionHeader: SH3 } = window;

// ═══ SOCIAL ═══
function SocialScreen({ cardVariant }) {
  const [tab, setTab] = React.useState('chats');
  return (
    <div style={{ minHeight: '100%', padding: '60px 0 120px', position: 'relative', overflow: 'hidden', background: T3.ink0 }}>{React.createElement(window.VibeBackdrop, { variant: 'social' })}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontFamily: T3.fontDisplay, fontSize: 48, color: T3.textHi, letterSpacing: -1, lineHeight: 1 }}>
          Ton <span style={{ color: T3.orange }}>cercle</span>.
        </div>
        <div style={{ marginTop: 8, color: T3.textMid, fontFamily: T3.fontSans, fontSize: 14 }}>5 conversations · 2 groupes actifs</div>
      </div>

      {/* tabs */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 6 }}>
        {[['chats','Messages',I3.chat],['groups','Groupes',I3.users],['find','Trouver',I3.search]].map(([id, label, Ic]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '12px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: tab === id ? 'rgba(0,108,255,0.15)' : 'transparent',
            color: tab === id ? T3.textHi : T3.textMid,
            fontFamily: T3.fontSans, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            border: tab === id ? '1px solid rgba(0,108,255,0.3)' : '1px solid transparent',
          }}><Ic size={16}/> {label}</button>
        ))}
      </div>

      {/* active stories */}
      <div style={{ padding: '20px 20px 10px', display: 'flex', gap: 12, overflowX: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T3.textMid }}>
            <I3.plus size={22}/>
          </div>
          <span style={{ fontFamily: T3.fontSans, fontSize: 10, color: T3.textLo }}>Ta story</span>
        </div>
        {MF3.map(f => (
          <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ padding: 2, borderRadius: 32, background: `linear-gradient(135deg, ${T3.orange}, ${T3.blue})` }}>
              <div style={{ width: 58, height: 58, borderRadius: 29, background: f.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: `2px solid ${T3.ink0}` }}>{f.emoji}</div>
            </div>
            <span style={{ fontFamily: T3.fontSans, fontSize: 10, color: T3.textMid, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* add friends cta */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ ...cs3(cardVariant), padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(135deg, rgba(0,108,255,0.2), rgba(255,106,0,0.15))`, border: '1px solid rgba(0,108,255,0.3)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${T3.blueStart}, ${T3.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <I3.qr size={22}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T3.fontSans, fontSize: 14, color: T3.textHi, fontWeight: 600 }}>Ajoute tes potes</div>
            <div style={{ fontFamily: T3.fontSans, fontSize: 12, color: T3.textMid }}>QR, contact ou pseudo</div>
          </div>
          <I3.chevronRight size={18} style={{ color: T3.textMid }}/>
        </div>
      </div>

      {/* messages */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontFamily: T3.fontMono, fontSize: 10, color: T3.textLo, textTransform: 'uppercase', letterSpacing: 1.5, padding: '10px 4px' }}>Récent</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MF3.map(f => (
            <div key={f.id} style={{ ...cs3(cardVariant), padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: f.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{f.emoji}</div>
                {f.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, background: '#1DB954', border: `2.5px solid ${T3.ink1}` }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontFamily: T3.fontSans, fontSize: 14, color: T3.textHi, fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontFamily: T3.fontMono, fontSize: 10, color: T3.textLo }}>{f.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: T3.fontSans, fontSize: 13, color: T3.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.last}</span>
                  {f.unread > 0 && <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: T3.orange, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontFamily: T3.fontSans }}>{f.unread}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.SocialScreen = SocialScreen;

// ═══ PROFILE ═══
function ProfileScreen({ cardVariant }) {
  return (
    <div style={{ minHeight: '100%', paddingBottom: 120, position: 'relative', overflow: 'hidden', background: T3.ink0 }}>{React.createElement(window.VibeBackdrop, { variant: 'profile' })}
      {/* cover */}
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <BG3 colors={[T3.blue, T3.orange]}/>
        <div style={{ position: 'absolute', top: 56, right: 20, display: 'flex', gap: 8, zIndex: 5 }}>
          {[I3.share, I3.settings].map((Ic, i) => (
            <button key={i} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Ic size={18}/></button>
          ))}
        </div>
      </div>
      {/* avatar + info */}
      <div style={{ padding: '0 20px', marginTop: -56, position: 'relative' }}>
        <div style={{ width: 112, height: 112, borderRadius: 56, border: `4px solid ${T3.ink0}`, background: `linear-gradient(135deg, ${T3.orangeStart}, ${T3.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, marginBottom: 14 }}>🧑</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: T3.fontDisplay, fontSize: 38, color: T3.textHi, letterSpacing: -1, lineHeight: 1 }}>Alex <span style={{ }}>Durand</span></div>
          <I3.verified size={20} style={{ color: T3.blue }}/>
        </div>
        <div style={{ fontFamily: T3.fontMono, fontSize: 12, color: T3.textLo, marginTop: 6, letterSpacing: 0.5 }}>@alex.d · Paris 11e · depuis fév. 2025</div>
        <div style={{ fontFamily: T3.fontSans, fontSize: 14, color: T3.textMid, marginTop: 12, lineHeight: 1.5 }}>
          Dispo pour une rando, un apéro ou un match de foot improvisé. <span style={{ color: T3.orange }}>DM ouverts</span>.
        </div>

        {/* stats strip */}
        <div style={{ ...cs3(cardVariant), padding: '16px', marginTop: 18, display: 'flex' }}>
          {[['42','Events',T3.blue],['18','Créés',T3.orange],['124','Potes','#B65CFF'],['2.4k','XP','#1DB954']].map(([n, l, c], i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}/>}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: T3.fontDisplay, fontSize: 28, color: c, letterSpacing: -0.5, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: T3.fontMono, fontSize: 10, color: T3.textLo, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <B3 full variant="primary" icon={<I3.settings size={16}/>}>Éditer</B3>
          <button style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: T3.textHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I3.qr size={20}/>
          </button>
        </div>

        {/* badges */}
        <div style={{ marginTop: 28 }}>
          <SH3 icon={<I3.trophy size={18} style={{ color: T3.orange }}/>} title="Badges" eyebrow="4 sur 12 débloqués"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
            {MB3.map(b => (
              <div key={b.id} style={{
                ...cs3(cardVariant), padding: '14px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                opacity: b.got ? 1 : 0.35,
                position: 'relative', overflow: 'hidden',
              }}>
                {b.got && b.tier === 'gold' && <div style={{ position: 'absolute', top: -10, right: -10, width: 40, height: 40, background: `radial-gradient(circle, ${T3.orange}, transparent)`, opacity: 0.4 }}/>}
                <div style={{ fontSize: 32, position: 'relative', zIndex: 1 }}>{b.emoji}</div>
                <div style={{ fontFamily: T3.fontSans, fontSize: 11, color: T3.textHi, fontWeight: 600, textAlign: 'center', position: 'relative', zIndex: 1 }}>{b.name}</div>
                <div style={{ fontFamily: T3.fontMono, fontSize: 9, color: T3.textLo, textAlign: 'center', position: 'relative', zIndex: 1 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginTop: 28 }}>
          <SH3 icon={<I3.sparkle size={18} style={{ color: T3.blue }}/>} title="Ses vibes"/>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {['🏃 Running','🥾 Rando','🍷 Vin nature','🎭 Théâtre','🍝 Ramen','🎧 Techno','📚 Book clubs','🌅 Sunsets'].map(t => (
              <div key={t} style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: T3.textHi, fontFamily: T3.fontSans, fontSize: 13 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ProfileScreen = ProfileScreen;

// ═══ MY EVENTS ═══
function MyEventsScreen({ cardVariant, setScreen }) {
  const [tab, setTab] = React.useState('upcoming');
  return (
    <div style={{ minHeight: '100%', padding: '60px 20px 120px', position: 'relative', overflow: 'hidden', background: T3.ink0 }}>{React.createElement(window.VibeBackdrop, { variant: 'events' })}
      <div style={{ fontFamily: T3.fontDisplay, fontSize: 48, color: T3.textHi, letterSpacing: -1, lineHeight: 1 }}>
        Mon <span style={{ color: T3.orange }}>agenda</span>.
      </div>
      <div style={{ marginTop: 8, color: T3.textMid, fontFamily: T3.fontSans, fontSize: 14 }}>3 à venir · 12 passés · 5 créés</div>

      {/* tabs pill */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginTop: 24 }}>
        {[['upcoming','À venir'],['hosting','Je hoste'],['past','Passés']].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: tab === id ? `linear-gradient(180deg, ${T3.blueStart}, ${T3.blue})` : 'transparent',
            color: tab === id ? '#fff' : T3.textMid, fontFamily: T3.fontSans, fontWeight: 600, fontSize: 12,
            boxShadow: tab === id ? '0 4px 12px rgba(0,108,255,0.3)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {/* Timeline grouped by date */}
      <div style={{ marginTop: 24 }}>
        {[
          { day: "Aujourd'hui", date: '19 avr', events: [ME3[3]] },
          { day: 'Demain', date: '20 avr', events: [ME3[0]] },
          { day: 'Vendredi', date: '21 avr', events: [ME3[1]] },
          { day: 'Samedi', date: '22 avr', events: [ME3[2]] },
        ].map((group, gi) => (
          <div key={gi} style={{ marginBottom: 20, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <div style={{ fontFamily: T3.fontDisplay, fontSize: 24, color: T3.textHi, letterSpacing: -0.5 }}>{group.day}</div>
              <div style={{ fontFamily: T3.fontMono, fontSize: 11, color: T3.textLo, letterSpacing: 0.5 }}>— {group.date}</div>
              {gi === 0 && <div style={{ padding: '3px 8px', borderRadius: 999, background: T3.orange, color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: T3.fontSans, letterSpacing: 1 }}>LIVE</div>}
            </div>
            {group.events.map(e => <EC3 key={e.id} event={e} cardVariant={cardVariant} onClick={() => setScreen('event')}/>)}
          </div>
        ))}
      </div>

      {/* empty state teaser */}
      <div style={{ ...cs3(cardVariant), padding: 24, marginTop: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}><BG3 colors={[T3.orange, T3.blue]}/></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: T3.fontDisplay, fontSize: 26, color: T3.textHi, letterSpacing: -0.5, marginBottom: 6 }}>Envie de <span style={{ color: T3.orange }}>bouger</span> ?</div>
          <div style={{ fontFamily: T3.fontSans, fontSize: 13, color: T3.textMid, marginBottom: 16 }}>Crée ton event en 30 secondes.</div>
          <B3 onClick={() => setScreen('create')} variant="orange" icon={<I3.plus size={18}/>}>Nouveau event</B3>
        </div>
      </div>
    </div>
  );
}
window.MyEventsScreen = MyEventsScreen;
