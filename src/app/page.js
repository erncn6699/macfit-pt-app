
import fs from 'fs';
import path from 'path';
import ClientScript from './ClientScript';
import Store from '../components/Store';

export default async function Page() {
  const configPath = path.join(process.cwd(), 'src/trainer-config.json');
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const t = cfg.trainer;
  const svc = cfg.services;
  const img = cfg.images;
  const st = cfg.site;
  const products = cfg.products || [];

  const expYears = new Date().getFullYear() - parseInt(t.years_experience, 10);
  
  const waNumber = t.whatsapp.replace(/\D/g, '');
  const waMsg    = encodeURIComponent(t.whatsapp_msg || 'Merhaba, web sitenizden ulaşıyorum.');
  const WA_HREF  = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : '#iletisim';

  function featureListHtml(features) { return (features || []).map(f => `<li>${f}</li>`).join(''); }
  function heroImagesHtml(heroArr) { return heroArr.map((h, i) => `<img class="hero-photo ${i===0?'active':''} ${h.promo?'hero-photo-promo':''}" src="${h.src}" alt="${h.alt}" loading="${i===0?'eager':'lazy'}" />`).join(''); }
  function heroDotsHtml(heroArr) { return heroArr.map((_, i) => `<button type="button"${i === 0 ? ' class="active"' : ''} aria-label="Görsel ${i + 1}"></button>`).join(''); }
  function bentoImagesHtml(bentoArr) { return bentoArr.map(b => `<div class="ph-box ph-filled"><img src="${b.src}" alt="${b.alt}" /><span class="ph-cap">${b.alt}</span></div>`).join(''); }
  function certRowsHtml(certs) { return (certs || []).map(c => `<div class="cert-row"><svg><use href="#i-check" width="16" height="16"></use></svg>${c}</div>`).join(''); }

  const vars = {
    TRAINER_NAME: t.name,
    TRAINER_NAME_UPPER: t.name.toUpperCase(),
    TRAINER_FIRST_NAME: t.name.split(' ')[0],
    TRAINER_ROLE: t.role,
    TRAINER_BRANCH: t.branch,
    TRAINER_EMAIL: t.email,
    TRAINER_TAGLINE: t.tagline,
    TRAINER_BIO_SHORT: t.bio_short,
    TRAINER_BIO_LONG: t.bio_long,
    TRAINER_INSTAGRAM: t.instagram || '',
    STAT_EXPERIENCE_YEARS: String(expYears),
    STAT_CLIENTS: t.clients || cfg.stats?.clients || '100+',
    STAT_CERTS: String((t.certifications || []).length),
    STAT_GROUP_MAX: '6',
    STAT_CERT_LABEL: t.certifications?.[0]?.split(' ')[0] || 'ACE',
    SERVICE_1_TITLE: svc.individual.title,
    SERVICE_1_DESC: svc.individual.description,
    SERVICE_1_FEATURES_HTML: featureListHtml(svc.individual.features),
    SERVICE_2_TITLE: svc.online.title,
    SERVICE_2_DESC: svc.online.description,
    SERVICE_2_FEATURES_HTML: featureListHtml(svc.online.features),
    SERVICE_3_TITLE: svc.group.title,
    SERVICE_3_DESC: svc.group.description,
    SERVICE_3_FEATURES_HTML: featureListHtml(svc.group.features),
    AVATAR_SRC: img.avatar,
    HERO_IMAGES_HTML: heroImagesHtml(img.hero),
    HERO_DOTS_HTML: heroDotsHtml(img.hero),
    BENTO_IMAGES_HTML: bentoImagesHtml(img.bento),
    CERT_ROWS_HTML: certRowsHtml(t.certifications),
    PAGE_TITLE: st.page_title,
    FOOTER_TAGLINE: st.footer_tagline,
    SITE_YEAR: st.year,
    WA_HREF: WA_HREF,
    IS_DEMO_JS: "true"
  };

  return (
    <>
      <ClientScript />
      <div>
  <svg style={{display: 'none'}} aria-hidden="true">
    <symbol id="i-camera" viewBox="0 0 24 24">
      <rect x={3} y={7} width={18} height={13} rx={2} fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7l1.5-2.5h5L16 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={12} cy="13.5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </symbol>
    <symbol id="i-check" viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={9} fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.3l2.6 2.6L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </symbol>
    <symbol id="i-chat" viewBox="0 0 24 24">
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx={8} cy={11} r="1.1" fill="currentColor" />
      <circle cx={12} cy={11} r="1.1" fill="currentColor" />
      <circle cx={16} cy={11} r="1.1" fill="currentColor" />
    </symbol>
    <symbol id="i-close" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </symbol>
    <symbol id="i-send" viewBox="0 0 24 24">
      <path d="M3 11l17-8-8 17-2.5-7.5L3 11z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </symbol>
    <symbol id="i-bot" viewBox="0 0 24 24">
      <rect x={4} y={8} width={16} height={12} rx={3} fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={12} cy="3.2" r="1.3" fill="currentColor" />
      <circle cx={9} cy={14} r="1.4" fill="currentColor" />
      <circle cx={15} cy={14} r="1.4" fill="currentColor" />
    </symbol>
  </svg>
  {vars.IS_DEMO_JS === "true" && (
    <div className="demo-banner">🏋️ Bu, <b>MacFit antrenörleri</b> için hazırlanan örnek bir web sitesidir — kendi adınız, fotoğraflarınız ve bilgilerinizle bu şekilde kurulur.</div>
  )}
  {/* Mobil drawer */}
  <div className="mobile-drawer" id="mobileDrawer" role="dialog" aria-modal="true" aria-label="Navigasyon menüsü">
    <div className="drawer-head">
      <div className="brand" style={{color: '#fff'}}><span className="brand-dot" />{vars.TRAINER_NAME}</div>
      <button className="drawer-close" id="drawerClose" aria-label="Menüyü kapat">×</button>
    </div>
    <div className="drawer-links">
      <a href="#hakkimda" className="drawer-link">Hakkımda</a>
      <a href="#hizmetler" className="drawer-link">Hizmetler</a>
      <a href="#sonuclar" className="drawer-link">Sonuçlar</a>
      <a href="#donusumler" className="drawer-link">Dönüşümler</a>
      <a href="#yorumlar" className="drawer-link">Yorumlar</a>
      <a href="#iletisim" className="drawer-link">İletişim</a>
    </div>
    <div className="drawer-cta">
      <a className="btn btn-dark" href="#iletisim" style={{width: '100%', justifyContent: 'center'}}>Ücretsiz Görüşme Talep Et</a>
    </div>
  </div>
  <div className="nav-shell" id="navShell">
    <div className="nav">
      <div className="brand"><span className="brand-dot" /></div>
      <nav className="links">
        <a href="#hakkimda">Hakkımda</a>
        <a href="#hizmetler">Hizmetler</a>
        <a href="#sonuclar">Sonuçlar</a>
        <a href="#donusumler">Dönüşümler</a>
        <a href="#yorumlar">Yorumlar</a>
        <a href="#iletisim">İletişim</a>
      </nav>
      <a className="btn-nav" href="#iletisim">Ücretsiz Görüşme</a>
      <button className="hamburger-btn" id="hamburgerBtn" aria-label="Menüyü aç" aria-expanded="false">
        <span /><span /><span />
      </button>
    </div>
  </div>
  {/* Floating CTA */}
  <a className="float-cta" id="floatCta" href="#iletisim">
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    Ücretsiz Görüşme
    <button className="float-cta-close" id="floatCtaClose" aria-label="Kapat" type="button">×</button>
  </a>
  <div className="wrap">
    <section className="hero center" style={{position: 'relative'}}>
      <div className="hero-aurora" aria-hidden="true" />
      <div className="profile-id profile-id-top">
        <div className="profile-avatar"><img src={`${vars.AVATAR_SRC}`} alt={`${vars.TRAINER_NAME}`} /></div>
        <div className="profile-name-wrap">
          <div className="profile-name">{vars.TRAINER_NAME}</div>
          <div className="profile-role">{vars.TRAINER_ROLE} · {vars.TRAINER_BRANCH}</div>
        </div>
      </div>
      <span className="eyebrow" lang="en">{vars.TRAINER_BRANCH} · Personal Trainer</span>
      <p className="lead">{vars.TRAINER_BIO_SHORT}</p>
      <div className="hero-ctas">
        <a className="btn btn-dark" href="#iletisim">Ücretsiz Görüşme Talep Et</a>
        <a className="btn btn-outline" href="#hizmetler">Hizmetleri İncele</a>
      </div>
      <div className="ai-nudge">
        <span className="ai-nudge-text">AI asistanım ile anında yanındayım!</span>
        <button type="button" className="btn btn-ai js-open-chat"><svg><use href="#i-chat" width={18} height={18} /></svg>Hemen Sohbet Et</button>
      </div>
      <div className="hero-frame">
        <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.HERO_IMAGES_HTML }} />
        <div className="hero-dots"><div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.HERO_DOTS_HTML }} /></div>
        <span className="hero-cap">{vars.TRAINER_BRANCH}</span>
      </div>
    </section>
  </div>
  <div className="strip">
    <div className="wrap strip-row">
      <div className="reveal reveal--delay-1"><b className="counter" data-target={`${vars.STAT_EXPERIENCE_YEARS}`}>{vars.STAT_EXPERIENCE_YEARS}</b> Yıl Deneyim</div>
      <div className="reveal reveal--delay-2"><b className="counter" data-target={`${vars.STAT_CLIENTS}`}>{vars.STAT_CLIENTS}</b> Danışan</div>
      <div className="reveal reveal--delay-3"><b>{vars.STAT_CERTS}</b> Sertifika</div>
      <div className="reveal reveal--delay-4"><b className="counter" data-target={`${vars.STAT_GROUP_MAX}`}>{vars.STAT_GROUP_MAX}</b> Grup Kontenjanı</div>
      <div className="reveal" lang="en"><b>{vars.STAT_CERT_LABEL}</b> <span lang="tr">Sertifikalı</span></div>
    </div>
  </div>
  <div className="wrap">
    <section id="one-bakis">
      <div className="bento">
        <div className="b-head reveal reveal--from-left">
          <span className="eyebrow">Bir Bakışta</span>
          <h2>Sertifikalar, deneyim, görseller.</h2>
          <p>Antrenörlük geçmişim, sertifikalarım ve çalışma alanımdan kısa bir kesit.</p>
        </div>
        <div className="b-grad b-green"><div className="lbl">Deneyim</div><div className="big">{vars.STAT_EXPERIENCE_YEARS} Yıl</div></div>
        <div className="b-grad b-gold"><div className="lbl">Danışan</div><div className="big">{vars.STAT_CLIENTS}</div></div>
        <div className="b-certs">
          <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.CERT_ROWS_HTML }} />
        </div>
      </div>
      <div className="ph-row">
        <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.BENTO_IMAGES_HTML }} />
      </div>
    </section>
    <section id="hakkimda">
      <div className="split">
        <div className="dark-card reveal reveal--from-left">
          <div className="mock-list">
            <div className="mock-row"><span>Danışan</span><span className="mock-val">Örnek Profil</span></div>
            <div className="mock-row"><span>Hedef</span><span className="mock-val">Kilo Verme</span></div>
            <div className="mock-row"><span>Program</span><span className="mock-val">8 Haftalık</span></div>
            <div className="mock-row"><span>Son Ölçüm</span><span className="mock-val">Bu Hafta</span></div>
          </div>
        </div>
        <div className="reveal reveal--from-right">
          <span className="eyebrow">Hakkımda</span>
          <h2 style={{marginTop: 10}}>Önce analiz, sonra program.</h2>
          <p className="muted" style={{marginTop: 16, lineHeight: '1.7', fontSize: 15}}>{vars.TRAINER_BIO_LONG}</p>
          <p className="muted" style={{marginTop: 12, lineHeight: '1.7', fontSize: 15}}>Yeni bir danışanla çalışmaya başlamadan önce hareket analizi yapıyor, geçmiş sakatlık ve günlük rutini birlikte değerlendiriyoruz.</p>
          <div className="feat-list">
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Kişiye Özel Analiz</div><div className="d">Program, ilk görüşmedeki hareket analizine göre kuruluyor.</div></div></div>
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Ölçüme Dayalı Takip</div><div className="d">8-12 haftalık dönemler, her dönem sonunda ölçülerek güncelleniyor.</div></div></div>
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Sürekli Güncelleme</div><div className="d">İlerleme tahmine değil, rakama dayanıyor.</div></div></div>
          </div>
        </div>
      </div>
    </section>
    <section id="hizmetler">
      <div className="split rev">
        <div className="reveal reveal--from-left">
          <span className="eyebrow">Hizmetler</span>
          <h2 style={{marginTop: 10}}>Üç çalışma şekli.</h2>
          <p className="muted" style={{marginTop: 14, fontSize: 15}}>Hedefinize ve zamanınıza göre uygun formatı birlikte seçiyoruz.</p>
          <div className="feat-list">
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Hareket analizi ile başlangıç</div></div></div>
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Haftalık program güncelleme</div></div></div>
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">WhatsApp üzerinden destek</div></div></div>
            <div className="feat-item"><svg><use href="#i-check" width={18} height={18} /></svg><div><div className="t">Aylık ölçüm takibi</div></div></div>
          </div>
        </div>
        <div className="light-card reveal reveal--from-right">
          <div className="chat-mock">
            <div className="chat-mock-bubble them">Bu hafta nasıl gidiyor?</div>
            <div className="chat-mock-bubble me">Squat 5kg arttı, harika gidiyor 💪</div>
            <div className="chat-mock-bubble them">Süper, yeni programı akşam gönderiyorum.</div>
          </div>
        </div>
      </div>
      <div className="tabs" id="teamTabs">
        <button type="button" className="tab active" data-target="card-bireysel">{vars.SERVICE_1_TITLE}</button>
        <button type="button" className="tab" data-target="card-online">{vars.SERVICE_2_TITLE}</button>
        <button type="button" className="tab" data-target="card-grup">{vars.SERVICE_3_TITLE}</button>
      </div>
      <div className="team-grid">
        <div className="team-card focus reveal reveal--delay-1" id="card-bireysel">
          <div><span className="team-tag">Program</span>
            <h3>{vars.SERVICE_1_TITLE}</h3>
            <p>{vars.SERVICE_1_DESC}</p>
            <ul><div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.SERVICE_1_FEATURES_HTML }} /></ul>
          </div>
          <a className="team-link" href={`${vars.WA_HREF}`} target="_blank" rel="noopener">Detay için yaz →</a>
        </div>
        <div className="team-card reveal reveal--delay-2" id="card-online">
          <div><span className="team-tag">Program</span>
            <h3>{vars.SERVICE_2_TITLE}</h3>
            <p>{vars.SERVICE_2_DESC}</p>
            <ul><div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.SERVICE_2_FEATURES_HTML }} /></ul>
          </div>
          <a className="team-link" href={`${vars.WA_HREF}`} target="_blank" rel="noopener">Detay için yaz →</a>
        </div>
        <div className="team-card reveal reveal--delay-3" id="card-grup">
          <div><span className="team-tag">Program</span>
            <h3>{vars.SERVICE_3_TITLE}</h3>
            <p>{vars.SERVICE_3_DESC}</p>
            <ul><div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.SERVICE_3_FEATURES_HTML }} /></ul>
          </div>
          <a className="team-link" href={`${vars.WA_HREF}`} target="_blank" rel="noopener">Detay için yaz →</a>
        </div>
      </div>
    </section>
    <section id="sonuclar">
      <div className="sec-head reveal">
        <span className="eyebrow">Sonuçlar</span>
        <h2>Program nasıl ilerliyor?</h2>
      </div>
      <div className="chart-panel reveal reveal--delay-1">
        <div>
          <svg viewBox="0 0 400 200" role="img" aria-label="12 haftalık temsili vücut yağ oranı grafiği" style={{width: '100%', height: 'auto'}}>
            <line x1={30} y1={20} x2={30} y2={170} stroke="#E2DED2" strokeWidth={1} />
            <line x1={30} y1={170} x2={380} y2={170} stroke="#E2DED2" strokeWidth={1} />
            <text x={10} y={28}>24%</text>
            <text x={10} y={108}>20%</text>
            <text x={10} y={174}>17%</text>
            <path d="M40 32 L120 70 L220 108 L370 150" fill="none" stroke="#2E7D32" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={40} cy={32} r={5} fill="#C9A227" />
            <circle cx={370} cy={150} r={5} fill="#C9A227" />
            <text x={34} y={190}>Hf.1</text>
            <text x={352} y={190}>Hf.12</text>
          </svg>
          <p className="chart-note">*Temsili ilerleme grafiğidir. Gerçek sonuçlar danışana, beslenmeye ve devamlılığa göre değişir.</p>
        </div>
        <div className="chart-side">
          <h3>Ölçüm odaklı takip</h3>
          <p>Her dönem başında ve sonunda vücut analizi yapıyoruz; program bu ölçülere göre güncelleniyor. İlerleme, tahmine değil rakama dayanıyor.</p>
        </div>
      </div>
    </section>
    <section id="donusumler" className="reveal">
      <div className="sec-head-row">
        <div className="sec-head" style={{marginBottom: 0}}>
          <span className="eyebrow">Donusumler</span>
          <h2>Danisan donusum ornekleri.</h2>
          <p>Danisanlarimizin izniyle paylasilan gercek once/sonra fotograflari.</p>
        </div>
        <a className="view-all" href="#iletisim">Teklif Al →</a>
      </div>
      <div className="update-grid">
        <div className="update-card reveal reveal--from-left">
          <div className="update-thumb">
            <img src="assets/images/transformation-1.jpg" alt="Danisan donusum - 12 hafta kilo verme" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12}} />
          </div>
          <div className="update-body">
            <span className="update-tag">12 hafta</span>
            <h3>Kilo Yonetimi · -14 kg</h3>
            <div className="update-arrow">detay →</div>
          </div>
        </div>
        <div className="update-card reveal reveal--delay-2">
          <div className="update-thumb">
            <img src="assets/images/transformation-2.jpg" alt="Danisan donusum - 16 hafta kas kazanimi" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12}} />
          </div>
          <div className="update-body">
            <span className="update-tag">16 hafta</span>
            <h3>Kas Kazanimi · +8 kg kas</h3>
            <div className="update-arrow">detay →</div>
          </div>
        </div>
        <div className="update-card reveal reveal--from-right reveal--delay-3">
          <div className="update-thumb">
            <img src="assets/images/transformation-3.jpg" alt="Danisan donusum - 10 hafta sekillenme" loading="lazy" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12}} />
          </div>
          <div className="update-body">
            <span className="update-tag">10 hafta</span>
            <h3>Sekillenme · -8 kg yag</h3>
            <div className="update-arrow">detay →</div>
          </div>
        </div>
      </div>
    </section>
    <section id="yorumlar">
      <div className="sec-head reveal">
        <span className="eyebrow">Yorumlar</span>
        <h2 style={{marginTop: 6}}>Danışanlar ne diyor?</h2>
        <p>Bu bölüm şablonun bir parçasıdır; yayına alırken kendi danışanlarınızın gerçek yorumlarıyla doldurulur.</p>
      </div>
      <div className="testi-carousel-wrap">
        <div className="testi-track" id="testiTrack">
          <div className="testi-card">
            <div className="testi-stars">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <p className="testi-text">“3 ayda 9 kilo verdim ve bunu diyet yapmadan, sürdürülebilir bir beslenme düzeniyle başardım. Program gerçekten kişiye özel — başka yerlerde hep hazır listeler verirlerdi, burada tamamen benim hayat tarzıma uyarlandı.”</p>
            <div className="testi-by">
              <div className="testi-avatar">AY</div>
              <div>
                <div className="testi-name">Ayşe Y.</div>
                <div className="testi-role">12 Haftalık Program · Kilo Verme</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <p className="testi-text">“Sırtımda eski bir sakatlık vardı, hiçbir antrenör bunu ciddiye almamıştı. Burada ilk görüşmede hareketi tek tek analiz ettik ve sıfırdan güvenli bir program oluşturduk. 8 haftada hem ağrım geçti hem 6 kg kas kattım.”</p>
            <div className="testi-by">
              <div className="testi-avatar">MK</div>
              <div>
                <div className="testi-name">Mehmet K.</div>
                <div className="testi-role">Online Koçluk · Kas Kazanımı</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <p className="testi-text">“Yurt dışında yaşıyorum ama online program mükemmel işliyor. Haftalık video görüşmemizde hareketleri birlikte gözden geçiriyoruz, beslenme planım da benim mutfağıma göre ayarlandı. Gerçekten lokasyon engeli hissetmedim.”</p>
            <div className="testi-by">
              <div className="testi-avatar">ZT</div>
              <div>
                <div className="testi-name">Zeynep T.</div>
                <div className="testi-role">Online Program · Londra</div>
              </div>
            </div>
          </div>
        </div>{/* /testi-track */}
      </div>{/* /testi-carousel-wrap */}
      <div className="testi-controls">
        <button className="testi-btn" id="testiPrev" aria-label="Onceki yorum">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="testi-dots" id="testiDots">
          <button className="testi-dot active" data-i={0} aria-label="Yorum 1" />
          <button className="testi-dot" data-i={1} aria-label="Yorum 2" />
          <button className="testi-dot" data-i={2} aria-label="Yorum 3" />
        </div>
        <button className="testi-btn" id="testiNext" aria-label="Sonraki yorum">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      <p className="testi-note">Danışan yorumları temsilidir. Yayına alırken kendi danışanlarınızın gerçek deneyimleriyle güncellenir.</p>
    </section>
    <Store products={products} />
      <section id="iletisim">
      <div className="cta-center">
        <span className="eyebrow">İletişim</span>
        <h2 style={{marginTop: 10}}>Hedefine birlikte ulaşalım.</h2>
        <p className="muted" style={{marginTop: 14, maxWidth: '52ch', marginInline: 'auto'}}>Ücretsiz ön görüşmede hedefinizi, geçmiş antrenman deneyiminizi ve uygun program formatını birlikte belirliyoruz.</p>
        <p className="chat-nudge">Formu doldurmadan da olur — <button type="button" className="js-open-chat">yapay zeka asistanına yazarak</button> anında yanıt alabilirsin.</p>
      </div>
      <div className="contact-card">
        <div className="contact-grid">
          <div className="contact-info">
            <h3 style={{fontSize: 17}}>İletişim Bilgileri</h3>
            <div className="line"><span className="k">Lokasyon</span><span>{vars.TRAINER_BRANCH} Şubesi</span></div>
            <div className="line"><span className="k">Saatler</span><span>Salı – Cumartesi, 09:00 – 18:00</span></div>
            <div className="line"><span className="k">E-posta</span><span>{vars.TRAINER_EMAIL}</span></div>
            <div className="wa-cta-block" style={{marginTop: 20}}>
              <p style={{fontSize: 13, color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0}}>Formu doldurmak yerine yapay zeka asistanına da yazabilirsiniz — program, fiyat ve randevu gibi sorularınızı anında yanıtlar.</p>
              <button type="button" className="btn btn-dark js-open-chat" style={{marginTop: 12, fontSize: 13, padding: '10px 18px'}}>AI Asistana Sor →</button>
            </div>
          </div>
          <form id="contactForm" action={`${vars.FORM_ACTION}`} method="POST">
            <input type="hidden" name="_subject" defaultValue={`${vars.TRAINER_NAME} — Yeni İletişim Formu`} />
            <div className="field">
              <label htmlFor="fname">Ad Soyad</label>
              <input id="fname" name="fname" type="text" placeholder="Adınız Soyadınız" required />
            </div>
            <div className="field">
              <label htmlFor="femail">E-posta</label>
              <input id="femail" name="femail" type="email" placeholder="ornek@mail.com" required />
            </div>
            <div className="field">
              <label htmlFor="fphone">Telefon <span style={{fontWeight: 400, textTransform: 'none', color: 'var(--ink-soft)'}}>(isteğe bağlı)</span></label>
              <input id="fphone" name="fphone" type="tel" placeholder="05XX XXX XX XX" />
            </div>
            <div className="field">
              <label htmlFor="fgoal">Hedefiniz</label>
              <select id="fgoal" name="fgoal">
                <option>Kilo verme</option>
                <option>Kas kazanımı</option>
                <option>Performans geliştirme</option>
                <option>Genel sağlık &amp; kondisyon</option>
                <option>Sakatlanma sonrası rehabilitasyon</option>
                <option>Diğer</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="fmsg">Mesaj</label>
              <textarea id="fmsg" name="fmsg" placeholder="Kısaca hedefinizden ve mevcut antrenman geçmişinizden bahsedin" defaultValue={""} />
            </div>
            <div className="form-submit-row">
              <button type="submit" id="formSubmitBtn" className="btn btn-black">Gönder</button>
            </div>
            <div id="formMsg" />
          </form>
        </div>
      </div>
    </section>
  </div>
  <footer>
    <div className="foot-grid">
      <div>
        <div className="foot-brand"><span className="brand-dot" />{vars.TRAINER_NAME_UPPER}</div>
        <p className="foot-tag">{vars.FOOTER_TAGLINE}</p>
        <div className="social-icons">
          <a className="social-icon" href={`${vars.WA_HREF}`} target="_blank" rel="noopener" aria-label="WhatsApp ile yaz">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </a>
          <a className="social-icon" href={`https://instagram.com/${vars.TRAINER_INSTAGRAM}`} target="_blank" rel="noopener" aria-label="Instagram profili">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x={2} y={2} width={20} height={20} rx={5} /><circle cx={12} cy={12} r={5} /><circle cx="17.5" cy="6.5" r={1} fill="currentColor" stroke="none" /></svg>
          </a>
        </div>
      </div>
      <div className="foot-col">
        <h4>Hizmetler</h4>
        <a href="#hizmetler">{vars.SERVICE_1_TITLE}</a>
        <a href="#hizmetler">{vars.SERVICE_2_TITLE}</a>
        <a href="#hizmetler">{vars.SERVICE_3_TITLE}</a>
      </div>
      <div className="foot-col">
        <h4>İletişim</h4>
        <a href={`mailto:${vars.TRAINER_EMAIL}`}>{vars.TRAINER_EMAIL}</a>
        <a href="#iletisim">{vars.TRAINER_BRANCH} Şubesi</a>
        <a href="#iletisim">Ücretsiz Görüşme Talep Et</a>
      </div>
    </div>
    <div className="foot-bottom">
      <span>© {vars.SITE_YEAR} {vars.TRAINER_NAME}</span>
      <span>MacFit antrenörlerine özel hazırlanan site şablonu.</span>
    </div>
  </footer>
  <button className="chat-fab" id="chatFab" aria-label="Sohbet asistanını aç" aria-expanded="false">
    <span className="chat-dot" aria-hidden="true" />
    <svg className="chat-fab-chat"><use href="#i-chat" width={24} height={24} /></svg>
    <svg className="chat-fab-close"><use href="#i-close" width={24} height={24} /></svg>
  </button>
  <div className="chat-panel" id="chatPanel" role="dialog" aria-label={`${vars.TRAINER_NAME} asistanı`} aria-hidden="true">
    <div className="chat-head">
      <div className="chat-head-avatar"><svg><use href="#i-bot" width={18} height={18} /></svg></div>
      <div className="chat-head-text">
        <div className="name">{vars.TRAINER_NAME} Asistanı</div>
        <div className="sub"><span className="live-dot" />Yapay zeka otomasyonu ile 7/24 yanıt</div>
      </div>
      <button className="chat-close-btn" id="chatCloseBtn" aria-label="Sohbeti kapat"><svg><use href="#i-close" width={18} height={18} /></svg></button>
    </div>
    <div className="chat-disclaimer">Bu asistan yapay zeka otomasyonuyla çalışır; yazdıkların otomatik olarak yanıtlanır, gerekirse {vars.TRAINER_FIRST_NAME} seni sonradan kendisi arar.</div>
    <div className="chat-body" id="chatBody" />
    <div className="chat-quick" id="chatQuick">
      <button type="button" data-q="Fiyatlar nedir">Fiyatlar 💰</button>
      <button type="button" data-q="Randevu nasıl alırım">Randevu 📅</button>
      <button type="button" data-q="Online çalışma var mı">Online koçluk 🌍</button>
      <button type="button" data-q="Beslenme desteği var mı">Beslenme 🥗</button>
      <button type="button" data-q="Kaç seans önerirsin">Kaç seans? 💪</button>
    </div>
    <div className="chat-input-row">
      <input type="text" id="chatInput" placeholder="Bir mesaj yaz..." aria-label="Mesajınızı yazın" />
      <button className="chat-send" id="chatSendBtn" aria-label="Gönder"><svg><use href="#i-send" width={16} height={16} /></svg></button>
    </div>
  </div>
</div>

    </>
  );
}
