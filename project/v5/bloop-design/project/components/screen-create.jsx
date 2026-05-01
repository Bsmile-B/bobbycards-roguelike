// Create wizard + Auth/Onboarding
const { BloopIcons: I4, BloopTokens: T4, BloopBtn: B4, cardStyle: cs4, BloopGoo: BG4 } = window;

// Vibes — la signature Bloop. On matche par vibe, pas par physique.
const VIBES = [
  { id: 'chill',    label: 'Chill',        emoji: '😌', color: '#3FE0E8' },
  { id: 'energique',label: 'Énergique',    emoji: '⚡',  color: '#FF4D8F' },
  { id: 'cosy',     label: 'Cosy',         emoji: '🕯️', color: '#FF8D3F' },
  { id: 'festif',   label: 'Festif',       emoji: '🎉', color: '#B65CFF' },
  { id: 'decouverte',label:'Découverte',   emoji: '🧭', color: '#006CFF' },
  { id: 'sportif',  label: 'Sportif',      emoji: '💪', color: '#1DB954' },
  { id: 'creatif',  label: 'Créatif',      emoji: '🎨', color: '#FF6A00' },
  { id: 'intello',  label: 'Intello',      emoji: '📚', color: '#6AA1FF' },
  { id: 'inclusif', label: 'Inclusif',     emoji: '🌈', color: '#FF4D8F' },
  { id: 'spontane', label: 'Spontané',     emoji: '🎲', color: '#C3F53C' },
];

function CreateScreen({ cardVariant, setScreen }) {
  const [step, setStep] = React.useState(0);
  const [cat, setCat] = React.useState('apero');
  const [vibes, setVibes] = React.useState(['chill','decouverte']);
  const [privacy, setPrivacy] = React.useState('public');
  const [slot, setSlot] = React.useState('tonight');
  const [priceMode, setPriceMode] = React.useState('free');
  const [minP, setMinP] = React.useState(3);
  const [maxP, setMaxP] = React.useState(8);
  const [title, setTitle] = React.useState('Apéro sur les quais');
  const [desc, setDesc] = React.useState("On ramène les bouteilles, venez avec vos potes ! Terrasse posée, bonne vibe garantie.");

  const steps = ['Vibe', 'Détails', 'Timing', 'Preview'];
  const toggleVibe = (id) => setVibes(v => v.includes(id) ? v.filter(x => x !== id) : v.length < 3 ? [...v, id] : v);

  return (
    <div style={{ minHeight: '100%', paddingBottom: 130, position: 'relative', overflow: 'hidden', background: T4.ink0 }}>
      {React.createElement(window.VibeBackdrop, { variant: 'create' })}
      {/* header */}
      <div style={{ position: 'relative', padding: '56px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={() => step > 0 ? setStep(step-1) : setScreen('home')} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textHi, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {step > 0 ? <I4.chevronLeft size={20}/> : <I4.close size={20}/>}
          </button>
          <div style={{ fontFamily: T4.fontMono, fontSize: 11, color: T4.textLo, letterSpacing: 1 }}>{String(step+1).padStart(2,'0')} / 04 · {steps[step].toUpperCase()}</div>
          <button style={{ background: 'transparent', border: 'none', color: T4.textMid, fontFamily: T4.fontSans, fontSize: 13, cursor: 'pointer' }}>Brouillon</button>
        </div>
        {/* progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T4.orange : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.3s', boxShadow: i === step ? `0 0 8px ${T4.orange}` : 'none' }}/>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', padding: '0 20px' }}>
        {/* ━━━━━━━━━━━━ STEP 0 : VIBE ━━━━━━━━━━━━ */}
        {step === 0 && (
          <div>
            <div style={{ fontFamily: T4.fontDisplay, fontSize: 42, color: T4.textHi, letterSpacing: -2, lineHeight: 0.95, fontWeight: 700 }}>
              c'est <span style={{ color: T4.orange }}>quelle</span><br/>vibe ?
            </div>
            <div style={{ marginTop: 10, color: T4.textMid, fontFamily: T4.fontSans, fontSize: 14, lineHeight: 1.4, marginBottom: 22 }}>
              Choisis 1 à 3 vibes. Les gens matcheront sur ton <span style={{ color: T4.orange, fontWeight: 600 }}>énergie</span>, pas sur ta photo de profil.
            </div>

            {/* category tiles */}
            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Catégorie</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 22 }}>
              {Object.entries(T4.cat).map(([k, c]) => (
                <div key={k} onClick={() => setCat(k)} style={{
                  aspectRatio: '1.15', borderRadius: 16, padding: 10,
                  background: cat === k ? `linear-gradient(135deg, ${c.solid}, ${c.bg})` : 'rgba(255,255,255,0.04)',
                  border: cat === k ? `2px solid ${c.solid}` : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer',
                  boxShadow: cat === k ? `0 6px 20px ${c.solid}60` : 'none', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 24 }}>{c.emoji}</div>
                  <div style={{ fontFamily: T4.fontSans, fontWeight: 600, fontSize: 12, color: cat === k ? '#fff' : T4.textHi, textTransform: 'capitalize' }}>{k}</div>
                </div>
              ))}
            </div>

            {/* vibes cloud */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5 }}>Vibes · 1 à 3</div>
              <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.orange, letterSpacing: 0.5 }}>{vibes.length}/3</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VIBES.map(v => {
                const sel = vibes.includes(v.id);
                return (
                  <div key={v.id} onClick={() => toggleVibe(v.id)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px',
                    borderRadius: 999, cursor: 'pointer',
                    background: sel ? `${v.color}22` : 'rgba(255,255,255,0.04)',
                    border: sel ? `1.5px solid ${v.color}` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: sel ? `0 0 0 3px ${v.color}15` : 'none', transition: 'all 0.18s',
                  }}>
                    <span style={{ fontSize: 16 }}>{v.emoji}</span>
                    <span style={{ fontFamily: T4.fontSans, fontSize: 13, fontWeight: 600, color: sel ? v.color : T4.textHi }}>{v.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━ STEP 1 : DÉTAILS ━━━━━━━━━━━━ */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: T4.fontDisplay, fontSize: 42, color: T4.textHi, letterSpacing: -2, lineHeight: 0.95, fontWeight: 700 }}>
              raconte<br/>ton <span style={{ color: T4.orange }}>plan</span>.
            </div>
            <div style={{ marginTop: 10, color: T4.textMid, fontFamily: T4.fontSans, fontSize: 14, marginBottom: 22 }}>Titre, cover, prix. Sois naturel, sois <span style={{ color: T4.orange, fontWeight: 600 }}>toi</span>.</div>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Cover</div>
            <div style={{ borderRadius: 20, marginBottom: 18, height: 180, position: 'relative', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(135deg, ${T4.cat[cat].solid}, ${T4.cat[cat].bg})` }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}><BG4 colors={[T4.cat[cat].solid, T4.cat[cat].ink]}/></div>
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(10,11,16,0.4)', backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: 13 }}>{T4.cat[cat].emoji}</span>
                <span style={{ fontFamily: T4.fontMono, fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 14px 14px', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))' }}>
                <div style={{ fontFamily: T4.fontDisplay, fontSize: 22, color: '#fff', letterSpacing: -0.8, fontWeight: 700, lineHeight: 1 }}>{title}</div>
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(10,11,16,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <I4.camera size={18}/>
              </div>
            </div>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Titre</div>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{
              width: '100%', padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: T4.textHi, fontFamily: T4.fontDisplay,
              fontSize: 20, letterSpacing: -0.5, fontWeight: 600, outline: 'none', marginBottom: 14, boxSizing: 'border-box',
            }}/>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Description</div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{
              width: '100%', padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: T4.textHi, fontFamily: T4.fontSans,
              fontSize: 14, lineHeight: 1.5, outline: 'none', marginBottom: 18, boxSizing: 'border-box',
              minHeight: 88, resize: 'none',
            }}/>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Participation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[['free','Gratuit','🆓'],['split','Au chapeau','🎩'],['paid','Payant','💳']].map(([id, l, em]) => (
                <div key={id} onClick={() => setPriceMode(id)} style={{
                  padding: '14px 8px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                  background: priceMode === id ? `linear-gradient(135deg, ${T4.blueStart}, ${T4.blue})` : 'rgba(255,255,255,0.04)',
                  border: priceMode === id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: priceMode === id ? '0 6px 16px rgba(0,108,255,0.3)' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{em}</div>
                  <div style={{ fontFamily: T4.fontSans, fontSize: 12, fontWeight: 600, color: priceMode === id ? '#fff' : T4.textHi }}>{l}</div>
                </div>
              ))}
            </div>
            {priceMode === 'paid' && (
              <div style={{ ...cs4(cardVariant), padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: T4.fontSans, fontSize: 13, color: T4.textMid }}>Prix par personne</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontFamily: T4.fontDisplay, fontSize: 24, color: T4.textHi, letterSpacing: -0.5, fontWeight: 700 }}>15€</span>
              </div>
            )}
          </div>
        )}

        {/* ━━━━━━━━━━━━ STEP 2 : TIMING ━━━━━━━━━━━━ */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: T4.fontDisplay, fontSize: 42, color: T4.textHi, letterSpacing: -2, lineHeight: 0.95, fontWeight: 700 }}>
              c'est <span style={{ color: T4.orange }}>quand</span><br/>& <span style={{ color: T4.orange }}>où</span> ?
            </div>
            <div style={{ marginTop: 10, color: T4.textMid, fontFamily: T4.fontSans, fontSize: 14, marginBottom: 22 }}>Plus c'est proche, plus ça va bouger <span style={{ color: T4.orange }}>vite</span>.</div>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Créneau rapide</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['now','Dans l\'heure','🔥','+50 XP bonus spontané'],['tonight','Ce soir','🌙',''],['tomorrow','Demain','☀️',''],['weekend','Ce week-end','🎉','']].map(([id, l, em, bonus]) => (
                <div key={id} onClick={() => setSlot(id)} style={{
                  padding: '14px 12px', borderRadius: 16, cursor: 'pointer',
                  background: slot === id ? `linear-gradient(135deg, ${T4.orangeStart}, ${T4.orange})` : 'rgba(255,255,255,0.04)',
                  border: slot === id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: slot === id ? '0 6px 18px rgba(255,106,0,0.35)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{em}</span>
                    <span style={{ fontFamily: T4.fontSans, fontWeight: 700, fontSize: 14, color: slot === id ? '#fff' : T4.textHi }}>{l}</span>
                  </div>
                  {bonus && <div style={{ marginTop: 4, fontFamily: T4.fontMono, fontSize: 9, color: slot === id ? '#fff' : T4.orange, letterSpacing: 0.5 }}>{bonus}</div>}
                </div>
              ))}
            </div>
            <div style={{ ...cs4(cardVariant), padding: 12, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <I4.calendar size={18} style={{ color: T4.textMid }}/>
              <span style={{ fontFamily: T4.fontSans, fontSize: 13, color: T4.textMid, flex: 1 }}>Choisir une date précise</span>
              <I4.chevronRight size={16} style={{ color: T4.textLo }}/>
            </div>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Heure</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 22, overflowX: 'auto', paddingBottom: 4 }}>
              {['18:00','19:00','19:30','20:00','20:30','21:00','22:00'].map((h, i) => (
                <div key={h} style={{
                  padding: '12px 18px', borderRadius: 12, flexShrink: 0,
                  background: i === 3 ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.04)',
                  border: i === 3 ? `1px solid ${T4.orange}` : '1px solid rgba(255,255,255,0.06)',
                  color: i === 3 ? T4.orange : T4.textHi,
                  fontFamily: T4.fontMono, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>{h}</div>
              ))}
            </div>

            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Lieu</div>
            {/* mini map placeholder */}
            <div style={{ ...cs4(cardVariant), padding: 0, marginBottom: 12, height: 140, position: 'relative', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,108,255,0.08)"/>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                {/* fake streets */}
                <path d="M 0 80 Q 120 50 240 80 T 400 60" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none"/>
                <path d="M 180 0 Q 200 70 160 140" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none"/>
                <path d="M 0 110 L 400 100" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none"/>
              </svg>
              <div style={{ position: 'absolute', left: '45%', top: '50%', transform: 'translate(-50%, -100%)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 0', background: T4.orange, transform: 'rotate(-45deg)', boxShadow: '0 6px 18px rgba(255,106,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ transform: 'rotate(45deg)', fontSize: 18 }}>📍</div>
                </div>
              </div>
            </div>
            <div style={{ ...cs4(cardVariant), padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(0,108,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T4.blue }}>
                <I4.pin size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T4.fontSans, fontSize: 14, fontWeight: 600, color: T4.textHi }}>Quai de Seine, 19e</div>
                <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, letterSpacing: 0.5, marginTop: 2 }}>À 800M · 10 MIN À PIED</div>
              </div>
              <I4.chevronRight size={18} style={{ color: T4.textMid }}/>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━ STEP 3 : PREVIEW ━━━━━━━━━━━━ */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: T4.fontDisplay, fontSize: 42, color: T4.textHi, letterSpacing: -2, lineHeight: 0.95, fontWeight: 700 }}>
              presque <span style={{ color: T4.orange }}>prêt</span>.
            </div>
            <div style={{ marginTop: 10, color: T4.textMid, fontFamily: T4.fontSans, fontSize: 14, marginBottom: 22 }}>Un dernier check avant de lancer le <span style={{ color: T4.orange, fontWeight: 600 }}>bloop</span>.</div>

            {/* privacy */}
            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Qui peut rejoindre</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[['public','Public','🌍'],['friends','Potes','👯'],['request','Sur demande','✋']].map(([id, l, em]) => (
                <div key={id} onClick={() => setPrivacy(id)} style={{
                  padding: '12px 8px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                  background: privacy === id ? `linear-gradient(135deg, ${T4.orangeStart}, ${T4.orange})` : 'rgba(255,255,255,0.04)',
                  border: privacy === id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: privacy === id ? '0 6px 16px rgba(255,106,0,0.3)' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{em}</div>
                  <div style={{ fontFamily: T4.fontSans, fontSize: 12, fontWeight: 700, color: privacy === id ? '#fff' : T4.textHi }}>{l}</div>
                </div>
              ))}
            </div>

            {/* jauge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5 }}>Jauge</span>
              <span style={{ fontFamily: T4.fontMono, fontSize: 11, color: T4.orange, letterSpacing: 0.5 }}>{minP}–{maxP} POTES</span>
            </div>
            <div style={{ ...cs4(cardVariant), padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontFamily: T4.fontSans, fontSize: 12, color: T4.textMid }}>
                <span>Min <b style={{ color: T4.textHi }}>{minP}</b></span>
                <span>Max <b style={{ color: T4.textHi }}>{maxP}</b></span>
              </div>
              <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'absolute', left: `${(minP/20)*100}%`, right: `${100-(maxP/20)*100}%`, top: 0, bottom: 0, borderRadius: 3, background: `linear-gradient(90deg, ${T4.orangeStart}, ${T4.orange})` }}/>
                <div style={{ position: 'absolute', left: `${(minP/20)*100}%`, top: -6, width: 18, height: 18, borderRadius: 9, background: '#fff', transform: 'translateX(-9px)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}/>
                <div style={{ position: 'absolute', left: `${(maxP/20)*100}%`, top: -6, width: 18, height: 18, borderRadius: 9, background: '#fff', transform: 'translateX(-9px)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}/>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => { setMinP(Math.max(2,minP-1)); }} style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textMid, fontSize: 11, fontFamily: T4.fontMono, cursor: 'pointer' }}>− MIN</button>
                <button onClick={() => { setMinP(Math.min(maxP-1,minP+1)); }} style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textMid, fontSize: 11, fontFamily: T4.fontMono, cursor: 'pointer' }}>+ MIN</button>
                <button onClick={() => { setMaxP(Math.max(minP+1,maxP-1)); }} style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textMid, fontSize: 11, fontFamily: T4.fontMono, cursor: 'pointer' }}>− MAX</button>
                <button onClick={() => { setMaxP(Math.min(20,maxP+1)); }} style={{ flex: 1, padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textMid, fontSize: 11, fontFamily: T4.fontMono, cursor: 'pointer' }}>+ MAX</button>
              </div>
            </div>

            {/* invite friends */}
            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Invite tes potes · optionnel</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {window.MOCK_FRIENDS.slice(0,5).map(f => (
                <div key={f.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px',
                  borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer'
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: f.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{f.emoji}</div>
                  <span style={{ fontFamily: T4.fontSans, fontSize: 12, color: T4.textHi }}>{f.name.split(' ')[0]}</span>
                  <I4.plus size={12} style={{ color: T4.orange }}/>
                </div>
              ))}
            </div>

            {/* group chat teaser */}
            <div style={{ ...cs4(cardVariant), padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${T4.blue}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${T4.blueStart}, ${T4.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T4.fontSans, fontSize: 13, fontWeight: 700, color: T4.textHi }}>Un groupe de chat va se créer</div>
                <div style={{ fontFamily: T4.fontSans, fontSize: 12, color: T4.textMid, marginTop: 1 }}>Tous les joiners discutent avant l'event</div>
              </div>
            </div>

            {/* gamification reward */}
            <div style={{ ...cs4(cardVariant), padding: 14, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                <div style={{ position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${T4.orange}, transparent 70%)` }}/>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🎁</span>
                  <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.orange, textTransform: 'uppercase', letterSpacing: 1.5 }}>Ce que tu gagnes</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[['+120','XP','orange'],['1','Badge Host','blue'],['+0.3','Trust','lime']].map(([n, l, col], i) => (
                    <div key={i} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontFamily: T4.fontDisplay, fontSize: 22, color: T4[col] || T4.orange, letterSpacing: -0.5, fontWeight: 700, lineHeight: 1 }}>{n}</div>
                      <div style={{ fontFamily: T4.fontMono, fontSize: 9, color: T4.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontFamily: T4.fontSans, fontSize: 11, color: T4.textLo, lineHeight: 1.4 }}>
                  +100 XP bonus si l'event est <b style={{ color: T4.textMid }}>réussi</b> (tout le monde vient & laisse un retour positif)
                </div>
              </div>
            </div>

            {/* final preview card */}
            <div style={{ fontFamily: T4.fontMono, fontSize: 10, color: T4.textLo, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Ta card dans le feed</div>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
              <div style={{ height: 150, position: 'relative', background: `linear-gradient(135deg, ${T4.cat[cat].solid}, ${T4.cat[cat].bg})` }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><BG4 colors={[T4.cat[cat].solid, T4.cat[cat].ink]}/></div>
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(10,11,16,0.4)', backdropFilter: 'blur(10px)' }}>
                  <span style={{ fontSize: 12 }}>{T4.cat[cat].emoji}</span>
                  <span style={{ fontFamily: T4.fontMono, fontSize: 9, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</span>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '5px 10px', borderRadius: 999, background: 'rgba(195,245,60,0.9)', fontFamily: T4.fontMono, fontSize: 9, color: '#0a0b10', fontWeight: 700, letterSpacing: 0.5 }}>NOUVEAU</div>
              </div>
              <div style={{ padding: 16, background: T4.ink1 }}>
                <div style={{ fontFamily: T4.fontDisplay, fontSize: 20, color: T4.textHi, letterSpacing: -0.5, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {vibes.map(vId => {
                    const v = VIBES.find(x => x.id === vId);
                    return v && <div key={vId} style={{ padding: '3px 9px', borderRadius: 999, background: `${v.color}22`, border: `1px solid ${v.color}44`, fontFamily: T4.fontSans, fontSize: 10, color: v.color, fontWeight: 600 }}>{v.emoji} {v.label.toLowerCase()}</div>;
                  })}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T4.fontSans, fontSize: 12, color: T4.textMid }}>
                    <I4.pin size={12}/> Quai de Seine <span style={{ opacity: 0.5 }}>·</span> <I4.clock size={12}/> 20:00
                  </div>
                  <div style={{ fontFamily: T4.fontMono, fontSize: 11, color: T4.orange, fontWeight: 600 }}>1/{maxP}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* sticky footer */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 28px', background: 'linear-gradient(180deg, transparent, rgba(10,11,16,0.98) 40%)' }}>
        <B4 full size="lg" variant="orange" onClick={() => step < 3 ? setStep(step+1) : setScreen('home')}
          icon={step === 3 ? <I4.sparkle size={18}/> : null}>
          {step === 3 ? 'Publier · Lancer le bloop' : 'Continuer'}
        </B4>
      </div>
    </div>
  );
}
window.CreateScreen = CreateScreen;

// ═══ ONBOARDING / AUTH ═══
function AuthScreen({ setScreen }) {
  return (
    <div style={{ background: T4.ink0, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      {React.createElement(window.VibeBackdrop, { variant: 'auth' })}
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '80px 24px 40px' }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <svg width="44" height="44" viewBox="-50 -50 100 100">
              <circle r="28" fill={T4.orange}>
                <animate attributeName="r" values="28;32;28" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="-10" cy="-8" r="8" fill="#fff" opacity="0.4"/>
            </svg>
          </div>
          <div style={{ fontFamily: T4.fontDisplay, fontSize: 28, color: T4.textHi, letterSpacing: -1, fontWeight: 700 }}>bloop</div>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,106,0,0.18)', border: '1px solid rgba(255,106,0,0.4)', marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: T4.orange, boxShadow: `0 0 8px ${T4.orange}` }}/>
          <span style={{ fontFamily: T4.fontMono, fontSize: 11, color: T4.orange, letterSpacing: 0.5 }}>834 EVENTS LIVE · PARIS</span>
        </div>
        <div style={{ fontFamily: T4.fontDisplay, fontSize: 68, color: T4.textHi, lineHeight: 0.92, letterSpacing: -3, fontWeight: 700 }}>
          rencontres<br/>par <span style={{ background: `linear-gradient(135deg, ${T4.orange}, ${T4.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>vibes</span>.
        </div>
        <div style={{ marginTop: 16, fontFamily: T4.fontSans, fontSize: 15, color: T4.textMid, lineHeight: 1.5, maxWidth: 320 }}>
          Pas de photos, pas de swipe. Rejoins des plans <span style={{ color: T4.orange, fontWeight: 600 }}>qui te ressemblent</span> — ou crée le tien. 18 à 40 ans, tous bienvenus.
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <B4 full size="lg" variant="orange" onClick={() => setScreen('home')} icon={<I4.sparkle size={18}/>}>Commencer</B4>
          <button style={{ height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: T4.textHi, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: T4.fontSans, fontWeight: 600, fontSize: 15 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
            Continuer avec Google
          </button>
          <div style={{ marginTop: 16, textAlign: 'center', fontFamily: T4.fontSans, fontSize: 13, color: T4.textLo }}>
            Déjà un compte ? <span style={{ color: T4.orange, fontWeight: 600 }}>Se connecter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AuthScreen = AuthScreen;
