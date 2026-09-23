const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const HTMLtoJSX = require('htmltojsx');

const htmlPath = path.join(__dirname, '../src/template.html');
const configPath = path.join(__dirname, '../trainer-config.json');

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// We need a custom HTMLtoJSX converter because we want to preserve {{VAR}} if possible,
// but since {{VAR}} breaks JSX parsing if used as an attribute (like class="{{VAR}}"),
// we will replace {{VAR}} with unique tokens, convert to JSX, and then replace back to JS expressions.

const converter = new HTMLtoJSX({
  createClass: false,
});

// 1. Extract CSS
const styleNode = $('style');
let cssContent = styleNode.html();
if (cssContent) {
  const cssPath = path.join(__dirname, 'src/app/globals.css');
  const globalsCssTemplate = `@import "tailwindcss";\n`;
  fs.writeFileSync(cssPath, globalsCssTemplate + '\n' + cssContent);
  styleNode.remove();
}

// Extract script
const scriptNodes = $('script');
scriptNodes.remove();

// Process SVG use tags (htmltojsx sometimes struggles with them)
$('use').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
        // htmltojsx will lowercase href to href, which is fine, but in React we want to ensure it works.
    }
});

// Fix image tags to be self closing for safety, though htmltojsx handles it
// Replace Handlebars syntax before conversion
let bodyHtml = $('body').html();
// HTMLtoJSX fails on `<!-- slide -->` comments, remove them or keep them, actually no slides here.
// Replace {{#if IS_DEMO}} ... {{/if}} with a unique tag
bodyHtml = bodyHtml.replace(/\{\{#if IS_DEMO\}\}/g, '<isdemo>');
bodyHtml = bodyHtml.replace(/\{\{\/if\}\}/g, '</isdemo>');

// HTMLtoJSX throws errors if a style attribute is invalid or contains handlebars. Let's see if we have any.
// If not, we convert.
let jsx = converter.convert(bodyHtml);

// 2. Post process JSX to replace {{VAR}} with {config.VAR}
// Find all {{VAR}} and convert to {config.VAR} or props.VAR. Since we'll render this inside Page component,
// we can just use `vars.VAR` where vars is calculated in the component.

// Also convert <isdemo> to {vars.IS_DEMO_JS === "true" && (...)}
jsx = jsx.replace(/<isdemo>/g, '{vars.IS_DEMO_JS === "true" && (');
jsx = jsx.replace(/<\/isdemo>/g, ')}');

// Handle variables
// Wait, if {{VAR}} is inside an attribute, it might have been converted to:
// href="https://wa.me/{{WA_HREF}}"
// We want href={`https://wa.me/${vars.WA_HREF}`}
jsx = jsx.replace(/([a-zA-Z0-9_]+)="([^"]*?)\{\{([A-Z0-9_]+)\}\}([^"]*?)"/g, (match, p1, p2, p3, p4) => {
    return `${p1}={\`${p2}\${vars.${p3}}${p4}\`}`;
});
// Run it twice for multiple vars in one attribute
jsx = jsx.replace(/([a-zA-Z0-9_]+)="([^"]*?)\{\{([A-Z0-9_]+)\}\}([^"]*?)"/g, (match, p1, p2, p3, p4) => {
    return `${p1}={\`${p2}\${vars.${p3}}${p4}\`}`;
});

// For variables in text nodes: htmltojsx converts {{VAR}} to {'{'}{'{'}VAR{'}'}{'}'}
jsx = jsx.replace(/\{'\{'\}\{'\{'\}([A-Z0-9_]+)\{'\}'\}\{'\}'\}/g, '{vars.$1}');
// Fallback if not converted by htmltojsx
jsx = jsx.replace(/\{\{([A-Z0-9_]+)\}\}/g, '{vars.$1}');

// Handle the dynamic HTML variables (e.g. HERO_IMAGES_HTML) which should use dangerouslySetInnerHTML
const dangerousVars = [
    'HERO_IMAGES_HTML', 'HERO_DOTS_HTML', 'BENTO_IMAGES_HTML', 'CERT_ROWS_HTML', 
    'SERVICE_1_FEATURES_HTML', 'SERVICE_2_FEATURES_HTML', 'SERVICE_3_FEATURES_HTML'
];
dangerousVars.forEach(v => {
    jsx = jsx.split(`{vars.${v}}`).join(`<div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vars.${v} }} />`);
});

// Wrap in a Next.js Page component

// Inject ClientScript and Store components
jsx = jsx.replace('<section id="iletisim"', '<Store products={products} />\n      <section id="iletisim"');

const pageComponent = `
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
  
  const waNumber = t.whatsapp.replace(/\\D/g, '');
  const waMsg    = encodeURIComponent(t.whatsapp_msg || 'Merhaba, web sitenizden ulaşıyorum.');
  const WA_HREF  = waNumber ? \`https://wa.me/\${waNumber}?text=\${waMsg}\` : '#iletisim';

  function featureListHtml(features) { return (features || []).map(f => \`<li>\${f}</li>\`).join(''); }
  function heroImagesHtml(heroArr) { return heroArr.map((h, i) => \`<img class="hero-photo \${i===0?'active':''} \${h.promo?'hero-photo-promo':''}" src="\${h.src}" alt="\${h.alt}" loading="\${i===0?'eager':'lazy'}" />\`).join(''); }
  function heroDotsHtml(heroArr) { return heroArr.map((_, i) => \`<button type="button"\${i === 0 ? ' class="active"' : ''} aria-label="Görsel \${i + 1}"></button>\`).join(''); }
  function bentoImagesHtml(bentoArr) { return bentoArr.map(b => \`<div class="ph-box ph-filled"><img src="\${b.src}" alt="\${b.alt}" /><span class="ph-cap">\${b.alt}</span></div>\`).join(''); }
  function certRowsHtml(certs) { return (certs || []).map(c => \`<div class="cert-row"><svg><use href="#i-check" width="16" height="16"></use></svg>\${c}</div>\`).join(''); }

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
      ${jsx}
    </>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src/app/page.js'), pageComponent);
console.log("Migration script complete.");
