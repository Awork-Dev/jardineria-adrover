// Jardinería Adrover — web + vigilante de noticias
// Requiere: binding KV llamado DATOS y un Cron Trigger cada 3 horas

import { TEL, EMAIL, TEL_FIJO, IDIOMAS, FOTOS } from './datos.js';
import { vigilar, noticias } from './noticias.js';
import { T, G, CULT_G, HT } from './textos.js';
import { PLANTAS_G, CAL_G, DOC_G, XERO_G, PLANTA_MES, PM_T } from './guia.js';
import { TITULAR, LEGAL_LISTO, LEGAL, ACTUALIZADO } from './legal.js';
import { icono, manifiesto, cabeceraIconos } from '../../compartido/iconos.js';
import { ICONOS } from '../../compartido/iconos-web.js';

const TODAS = new Set([FOTOS.hero, FOTOS.vivero, FOTOS.mant, FOTOS.poda, FOTOS.diseno, FOTOS.flor, ...FOTOS.galeria,
  "1ifQJNiTOw-VO1CCIOSpnTPiVg4vUtCYB", "1insih4dhc_okLA8toUKb1whvDuSzPc-q", "1Uj5v5HCLCmlNs7ugBB-54LO0MjsSEvvU",
  "16O1eYhY7DvQfKhdsPt34RzDZK3NsBNti", "1uOPLB0PIp0tf2PjPHcnalYgEciSNshid"]);

const CACHE_IMG = "public, max-age=31536000, immutable";
async function imagen(id, w, env, webp) {
  if (!TODAS.has(id)) return new Response("No encontrada", { status: 404 });
  const ancho = [480, 900, 1600].includes(w) ? w : 900;
  const clave = `img:${id}:${ancho}${webp ? ":webp" : ""}`;
  const cab = (ct) => ({ "content-type": ct, "cache-control": CACHE_IMG, vary: "Accept" });
  if (env.DATOS) {
    const { value, metadata } = await env.DATOS.getWithMetadata(clave, "arrayBuffer");
    if (value) return new Response(value, { headers: cab(metadata?.ct || "image/jpeg") });
  }
  const urls = [`https://lh3.googleusercontent.com/d/${id}=w${ancho}${webp ? "-rw" : ""}`, `https://drive.google.com/thumbnail?id=${id}&sz=w${ancho}`];
  for (const u of urls) {
    const r = await fetch(u, { redirect: "follow" });
    const ct = r.headers.get("content-type") || "";
    if (r.ok && ct.startsWith("image/")) {
      const buf = await r.arrayBuffer();
      if (env.DATOS) await env.DATOS.put(clave, buf, { metadata: { ct } });
      return new Response(buf, { headers: cab(ct) });
    }
  }
  return new Response("Imagen no disponible", { status: 502 });
}

const img = (id, w = 900) => `/img/${id}?w=${w}`;
const srcset = (id, sizes) => `srcset="${[480, 900, 1600].map((w) => `${img(id, w)} ${w}w`).join(", ")}" sizes="${sizes}"`;
const ICO = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 9.5c.3 2.6 3.4 5.7 6 6l1.3-1.4-2-1-1 .8c-1-.4-2.3-1.7-2.7-2.7l.8-1-1-2Z" fill="currentColor"/></svg>',
  sms: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 17v4l4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="10.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1.2" fill="currentColor"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

const RUTAS = ["/", "/servicios", "/vivero", "/guia", "/herramientas", "/noticias", "/contacto"];
const u = (lang, ruta) => (lang === "es" ? "" : "/" + lang) + (ruta === "/" ? (lang === "es" ? "/" : "") : ruta);

function canales(t) {
  const msg = encodeURIComponent(t.canal.msg);
  const asunto = encodeURIComponent(t.canal.asunto);
  let h = '<div class="canales">';
  if (TEL) h += `<a class="canal wa" href="https://wa.me/${TEL}?text=${msg}" target="_blank" rel="noopener">${ICO.chat}<span>WhatsApp</span></a>`
    + `<a class="canal sms" href="sms:+${TEL}?&body=${msg}">${ICO.sms}<span>SMS</span></a>`;
  h += `<a class="canal mail" href="mailto:${EMAIL}?subject=${asunto}&body=${msg}">${ICO.mail}<span>${t.canal.email}</span></a></div>`;
  return h;
}
function flotante(t) {
  if (!TEL) return "";
  return `<a class="flotante" href="https://wa.me/${TEL}?text=${encodeURIComponent(t.canal.msg)}" target="_blank" rel="noopener" aria-label="${t.canal.aria}">${ICO.chat}</a>`;
}
function menu(lang, ruta, t) {
  const links = RUTAS.map((r, i) => `<a href="${u(lang, r)}"${r === "/contacto" ? ' class="btn" style="padding:10px 20px"' : (r === ruta ? ' class="on"' : "")}>${t.nav[i]}</a>`);
  const langs = '<span class="langs">' + IDIOMAS.map((l) => `<a href="${u(l, ruta)}" hreflang="${l}"${l === lang ? ' class="on"' : ""}>${l.toUpperCase()}</a>`).join("") + "</span>";
  return links.slice(0, -1).join("") + langs + links[links.length - 1];
}
const phead = (foto, x) => `<section class="phead"><img src="${img(foto, 1600)}" ${srcset(foto, "100vw")} alt="" fetchpriority="high"><div class="wrap"><div class="eyebrow">${x[0]}</div><h1>${x[1]}</h1><p>${x[2]}</p></div></section>`;
const cab = (x) => `<div class="cab rv"><div><div class="eyebrow">${x[0]}</div><h2>${x[1]}</h2></div><p>${x[2]}</p></div>`;

const CUERPOS = {
  "/": (t, lang) => `<section class="hero" style="padding:0"><img src="${img(FOTOS.hero, 1600)}" ${srcset(FOTOS.hero, "100vw")} alt="Jardinería Adrover" fetchpriority="high">
<div class="wrap"><div class="eyebrow">${t.hero[0]}</div><h1>${t.hero[1]}</h1><p>${t.hero[2]}</p>
<a class="btn" href="${u(lang, "/contacto")}">${t.hero[3]}</a><a class="btn lin" href="${u(lang, "/servicios")}">${t.hero[4]}</a></div></section>
<div class="wrap"><div class="cifras rv">${t.cifras.map((c) => `<div><b>${c[0]}</b><span>${c[1]}</span></div>`).join("")}</div></div>
<section><div class="wrap">${cab(t.desc)}
<div class="accesos">${[["/servicios", FOTOS.mant], ["/vivero", FOTOS.vivero], ["/noticias", "1Rt7joKht4znZ66jmYXhzAE6erH0HT8tE"]].map(([r, f], i) => `<a class="card acceso rv" href="${u(lang, r)}"><img loading="lazy" src="${img(f)}" ${srcset(f, "(max-width:980px) 100vw, 390px")} alt="${t.acc[i][0]}"><div><h3>${t.acc[i][0]}</h3><p>${t.acc[i][1]}</p><span class="ver">${t.acc[i][2]}</span></div></a>`).join("")}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="cta rv"><div><div class="eyebrow">${t.cta[0]}</div><h2>${t.cta[1]}</h2><p>${t.cta[2]}</p></div><div>${canales(t)}</div></div></div></section>`,

  "/servicios": (t) => `${phead(FOTOS.mant, t.servPh)}
<section id="servicios"><div class="wrap">${cab(t.serv)}
<div class="serv">${[FOTOS.mant, FOTOS.poda, FOTOS.diseno, FOTOS.flor].map((f, i) => `<article class="card rv"><img loading="lazy" src="${img(f)}" ${srcset(f, "(max-width:600px) 100vw, (max-width:980px) 50vw, 290px")} alt="${t.cards[i][0]}"><div><h3>${t.cards[i][0]}</h3><p>${t.cards[i][1]}</p><ul>${t.cards[i][2].map((x) => `<li>${x}</li>`).join("")}</ul></div></article>`).join("")}</div></div></section>
<section id="proceso" class="suave"><div class="wrap">${cab(t.proc)}
<div class="pasos">${t.pasos.map((p, i) => `<div class="paso rv"><span>0${i + 1}</span><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join("")}</div></div></section>`,

  "/vivero": (t, lang) => `${phead(FOTOS.vivero, t.vivPh)}
<section id="vivero"><div class="wrap split"><img class="rv" loading="lazy" src="${img(FOTOS.vivero, 1600)}" ${srcset(FOTOS.vivero, "(max-width:980px) 100vw, 620px")} alt="${t.viv[0]}">
<div class="rv"><div class="eyebrow">${t.viv[0]}</div><h2>${t.viv[1]}</h2><p style="color:var(--gris)">${t.viv[2]}</p><p style="color:var(--gris)">${t.viv[3]}</p>
<ul>${t.viv[4].map((x) => `<li>${x}</li>`).join("")}</ul><a class="btn" href="${u(lang, "/contacto")}" style="background:var(--verde2);color:#fff">${t.viv[5]}</a></div></div></section>
<section id="galeria" class="oscuro"><div class="wrap">${cab(t.gal)}
<div class="galeria">${FOTOS.galeria.map((id, i) => `<figure class="g g${i}"><img loading="lazy" src="${img(id, 900)}" ${srcset(id, "(max-width:600px) 100vw, (max-width:980px) 66vw, 400px")} alt="${t.gal[3]}"></figure>`).join("")}</div></div></section>`,

  "/noticias": (t) => `${phead("1m47kdFJeWuUVpKQIMY5Rn0Cp1Z4vw-gI", t.newsPh)}
<section id="noticias"><div class="wrap"><div class="cab rv"><div><div class="eyebrow">${t.news[0]}</div><h2>${t.news[1]}</h2></div>
<div><p>${t.news[2]}</p><div class="vig" style="margin-top:12px"><span class="dot"></span><span id="act">${t.nj.buscando}</span></div>${t.nj.nota ? `<p style="font-size:.85rem;margin-top:8px">${t.nj.nota}</p>` : ""}</div></div>
<div class="tabs"><button class="tab on" data-c="jardineria">${t.nj.tabs[0]}</button><button class="tab" data-c="ciencia">${t.nj.tabs[1]}</button><button class="tab" data-c="baleares">${t.nj.tabs[2]}</button></div>
<div class="news" id="lista"></div><div class="mas"><button class="btn" id="mas">${t.nj.mas}</button></div></div></section>`,

  "/contacto": (t) => `${phead("1oC5cZAisaPJDb3VU2dSulUxZzmPE8AQv", t.contPh)}
<section id="contacto" style="padding-bottom:0"><div class="wrap"><div class="contacto rv"><div><div class="eyebrow">${t.cont[0]}</div><h2>${t.cont[1]}</h2><p>${t.cont[2]}</p>
<p style="margin:26px 0 12px;color:#fff;font-weight:600">${t.cont[3]}</p>${canales(t)}
<div class="datos" style="margin-top:22px"><a href="mailto:${EMAIL}">${EMAIL}</a></div></div>
<img loading="lazy" src="${img("1oC5cZAisaPJDb3VU2dSulUxZzmPE8AQv", 1600)}" ${srcset("1oC5cZAisaPJDb3VU2dSulUxZzmPE8AQv", "(max-width:980px) 100vw, 600px")} alt="${t.cont[0]}"></div></div></section>
<section id="preguntas" class="suave"><div class="wrap faqw"><div class="rv"><div class="eyebrow">${t.faqH[0]}</div><h2>${t.faqH[1]}</h2><p style="color:var(--gris)">${t.faqH[2]}</p></div>
<div class="faq rv">${t.faq.map((q, i) => `<details${i ? "" : " open"}><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join("")}</div></div></section>`,
};

// ===== Guía, Herramientas y Presupuesto: páginas =====
for (const l of IDIOMAS) {
  T[l].nav.splice(3, 0, { es: "Guía", ca: "Guia", en: "Guide", de: "Ratgeber" }[l], HT[l].nav);
  T[l].meta["/guia"] = G[l].meta;
  T[l].meta["/herramientas"] = HT[l].meta;
}

CUERPOS["/guia"] = (t, lang) => {
  const g = G[lang];
  const op = (vals, txts) => vals.map((v, i) => `<option value="${v}">${txts[i]}</option>`).join("");
  return `${phead(FOTOS.flor, g.ph)}
<div class="subnav"><div class="wrap">${["calendario", "plantas", "doctor", "xero"].map((id, i) => `<a href="#${id}">${g.sub[i]}</a>`).join("")}<a href="${u(lang, "/herramientas")}">${HT[lang].nav} →</a></div></div>
<section id="calendario"><div class="wrap">${cab(g.cal)}
<div class="tabs" id="meses">${g.meses.map((m, i) => `<button class="tab" data-m="${i}">${m}</button>`).join("")}</div>
<div class="mesbox">${CAL_G[lang].map((ts, i) => `<div class="mes" data-m="${i}"${i ? " hidden" : ""}><h3>${g.mesesL[i]}</h3><ul>${ts.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div></div></section>
<section id="plantas" class="suave"><div class="wrap">${cab(g.pl)}
<div class="filtros"><input type="search" id="fq" placeholder="${g.f.buscar}" aria-label="${g.f.buscar}">
<select id="fl" aria-label="${g.f.luz[0]}">${op(["", "sol", "semi", "sombra"], g.f.luz)}</select>
<select id="fr" aria-label="${g.f.riego[0]}">${op(["", "bajo", "medio", "alto"], g.f.riego)}</select>
<label class="chk"><input type="checkbox" id="fm"> ${g.f.mascotas}</label><label class="chk"><input type="checkbox" id="fa"> ${g.f.auto}</label></div>
<div class="plantas">${PLANTAS_G.map((p) => {
    const [nom, txt] = p[5][lang];
    return `<article class="pl" data-luz="${p[1]}" data-riego="${p[2]}" data-pet="${p[3]}" data-auto="${p[4] ? 1 : 0}" data-q="${(nom + " " + p[0]).toLowerCase()}"><h3>${nom}</h3><i>${p[0]}</i><p>${txt}</p><div class="meta">${p[1].split(" ").map((x) => `<span class="chip">${g.et[x]}</span>`).join("")}<span class="chip">${g.et[p[2]]}</span><span class="chip${p[3] === "no" ? " mal" : p[3] === "si" ? " bien" : ""}">${g.et[p[3]]}</span>${p[4] ? `<span class="chip auto">${g.et.auto}</span>` : ""}</div></article>`;
  }).join("")}</div>
<p id="pnada" hidden>${g.f.nada}</p><p class="nota">${g.petNota}</p></div></section>
<section id="doctor"><div class="wrap faqw"><div class="rv"><div class="eyebrow">${g.doc[0]}</div><h2>${g.doc[1]}</h2><p style="color:var(--gris)">${g.doc[2]}</p>${TEL ? `<a class="canal wa" href="https://wa.me/${TEL}?text=${encodeURIComponent(g.docMsg)}" target="_blank" rel="noopener">${ICO.chat}<span>${g.docFoto}</span></a>` : ""}</div>
<div class="faq rv">${DOC_G[lang].map((d, i) => `<details${i ? "" : " open"}><summary>${d[0]}</summary><p><b>${g.docEt[0]}:</b> ${d[1]}</p><p><b>${g.docEt[1]}:</b> ${d[2]}</p></details>`).join("")}</div></div></section>
<section id="xero" class="oscuro"><div class="wrap">${cab(g.xero)}<div class="pasos xero">${XERO_G[lang].map((p, i) => `<div class="paso rv"><span>0${i + 1}</span><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join("")}
<div class="paso poli rv"><h3>${g.poli[0]}</h3><p>${g.poli[1]}</p><a class="btn" href="#plantas" id="verauto">${g.poli[2]}</a></div></div></div></section>`;
};

function guiaJs() {
  return `const mb=[...document.querySelectorAll('#meses .tab')],ms=[...document.querySelectorAll('.mes')];
const verMes=i=>{mb.forEach((b,j)=>b.classList.toggle('on',j==i));ms.forEach((m,j)=>m.hidden=j!=i)};
mb.forEach(b=>b.onclick=()=>verMes(+b.dataset.m));verMes(new Date().getMonth());
const q=id=>document.getElementById(id),pls=[...document.querySelectorAll('.pl')];
function filtra(){const t=q('fq').value.toLowerCase().trim(),l=q('fl').value,r=q('fr').value,m=q('fm').checked,a=q('fa').checked;let n=0;
pls.forEach(p=>{const ok=(!t||p.dataset.q.includes(t))&&(!l||p.dataset.luz.split(' ').includes(l))&&(!r||p.dataset.riego===r)&&(!m||p.dataset.pet==='si')&&(!a||p.dataset.auto==='1');p.hidden=!ok;if(ok)n++});q('pnada').hidden=n>0}
['fq','fl','fr','fm','fa'].forEach(i=>{q(i).addEventListener('input',filtra);q(i).addEventListener('change',filtra)});
q('verauto').onclick=()=>{q('fa').checked=true;filtra()};`;
}

CUERPOS["/herramientas"] = (t, lang) => {
  const h = HT[lang], x = h.t;
  const num = (n, l, v) => `<label>${l}<input type="number" name="${n}" value="${v}" min="0" step="any" inputmode="decimal"></label>`;
  const sel = (n, [l, ops], vals) => `<label>${l}<select name="${n}">${ops.map((o, i) => `<option value="${vals ? vals[i] : i}">${o}</option>`).join("")}</select></label>`;
  const card = (id, inputs) => `<article class="tool rv" data-tool="${id}"><h3>${x[id][0]}</h3><p>${x[id][1]}</p><div class="campos">${inputs}</div><div class="res" aria-live="polite"></div></article>`;
  const grupos = [
    [card("riego", num("m2", h.m2, 20) + sel("tipo", x.riego[2]) + sel("epoca", x.riego[3]) + sel("luz", x.riego[4])),
     card("goteo", num("n", x.goteo[2], 10) + num("g", x.goteo[3], 2) + num("q", x.goteo[4], 2) + num("l", x.goteo[5], 4)),
     card("ahorro", num("m2", x.ahorro[2], 50) + num("p", x.ahorro[3], 2)),
     card("lluvia", num("m2", x.lluvia[2], 80) + sel("z", x.lluvia[3], [400, 550, 1000, 550, 400]))],
    [card("tierra", num("a", x.tierra[2], 100) + num("b", x.tierra[3], 40) + num("c", x.tierra[4], 30)),
     card("mezcla", sel("tipo", x.mezcla[2]) + num("l", x.mezcla[3], 20)),
     card("abono", num("m2", h.m2, 30) + sel("tipo", x.abono[2])),
     card("dilucion", num("d", x.dilucion[2], 5) + num("por", x.dilucion[3], 1) + num("l", x.dilucion[4], 10)),
     card("compost", num("v", x.compost[2], 20))],
    [card("siembra", num("a", x.siembra[2], 3) + num("b", x.siembra[3], 1.2) + sel("c", [x.siembra[4], h.cult])),
     card("cesped", num("m2", h.m2, 50) + sel("met", x.cesped[2])),
     card("cosecha", `<label>${x.cosecha[2]}<input type="date" name="f"></label>` + sel("c", [x.cosecha[3], h.cult]))],
    [card("grava", num("m2", h.m2, 10) + num("cm", x.grava[2], 5) + sel("mat", x.grava[3])),
     card("maceta", num("d", x.maceta[2], 20))],
    [card("test", sel("a", x.test[2]) + sel("b", x.test[3]) + sel("c", x.test[4]))],
  ];
  return `${phead(FOTOS.galeria[4], h.ph)}
<div class="subnav"><div class="wrap">${h.grupos.map((g, i) => `<a href="#g${i}">${g}</a>`).join("")}<a href="${u(lang, "/guia")}">${T[lang].nav[3]} →</a></div></div>
<section style="padding-top:70px"><div class="wrap">${grupos.map((g, i) => `<h2 class="grupo" id="g${i}">${h.grupos[i]}</h2><div class="tools">${g.join("")}</div>`).join("")}</div></section>`;
};

function herrJs(lang) {
  const d = { T: HT[lang].t, CU: CULT_G, loc: T[lang].nj.loc, P: PLANTAS_G.map((p) => [p[5][lang][0], p[5][lang][1], p[1], p[2], p[3]]) };
  return `const H=${JSON.stringify(d).replace(/</g, "\\u003c")},X=H.T,CU=H.CU;
const f=(n,d=0)=>Number(n).toLocaleString(H.loc,{maximumFractionDigits:d});
const r=(s,o)=>s.replace(/\\{(\\w+)\\}/g,(_,k)=>o[k]);
const B=(a,b)=>'<b>'+a+'</b>'+(b?'<span>'+b+'</span>':'');
const S=s=>'<small>'+s+'</small>';
const F={
riego(v){const l=v.m2*[35,30,20,7][v.tipo]*[1,.5,.15][v.epoca]*[1,.75,.5][v.luz],d=[[2,3,7],[1,3,7],[2,4,10],[7,14,30]][v.tipo][v.epoca];return B(r(X.riego[5],{l:f(l)}),r(X.riego[6],{d,p:f(l*d/7)}))},
goteo(v){const m=v.g*v.q>0?v.l/(v.g*v.q)*60:0;return B(r(X.goteo[6],{m:f(m)}),r(X.goteo[7],{g:f(v.n*v.g),q:f(v.n*v.g*v.q,1)}))},
ahorro(v){const l=v.m2*850;return B(r(X.ahorro[4],{l:f(l)}),r(X.ahorro[5],{e:f(l/1000*v.p)}))},
lluvia(v){const l=v.m2*v.z*.8;return B(r(X.lluvia[4],{l:f(l)}),r(X.lluvia[5],{m:f(l/1000,1)}))},
tierra(v){const l=v.a*v.b*v.c/1000;return B(r(X.tierra[5],{l:f(l)}),r(X.tierra[6],{a:Math.ceil(l/50),b:Math.ceil(l/20)}))},
mezcla(v){return '<ul>'+X.mezclas[v.tipo].map(c=>'<li><b>'+c[1]+' %</b> '+c[0]+' · '+f(v.l*c[1]/100,1)+' L</li>').join('')+'</ul>'},
abono(v){const g=[30,40,40,2500,1000][v.tipo]*v.m2,c=g>=1000?f(g/1000,1)+' kg':f(g)+' g';return B(r(X.abono[3],{c}),r(X.abono[4],{f:X.abono[5][v.tipo]}))+S(X.abono[6])},
dilucion(v){return B(r(X.dilucion[5],{ml:f(v.por>0?v.d/v.por*v.l:0,1)}))},
compost(v){return B(r(X.compost[3],{a:f(v.v*2),b:f(v.v*3)}))+S(X.compost[4])},
siembra(v){const c=CU[v.c];return B(r(X.siembra[5],{n:f(Math.floor(v.a*v.b*1e4/(c[0]*c[1])))}),r(X.siembra[6],{a:c[0],b:c[1]}))},
cesped(v){return v.met==2?B(r(X.cesped[4],{m:f(v.m2*1.05,1)})):B(r(X.cesped[3],{k:f(v.m2*(v.met==0?35:20)/1000,2)}))},
cosecha(v){const d=new Date(v.f);if(isNaN(d))return '';const c=CU[v.c],o={day:'numeric',month:'long',year:'numeric'},D=n=>new Date(d.getTime()+n*864e5).toLocaleDateString(H.loc,o);return B(r(X.cosecha[4],{a:D(c[2]),b:D(c[3])}),X.cosecha[5])},
grava(v){const m=v.m2*v.cm/100;return B(r(X.grava[4],{m:f(m,2),s:Math.ceil(m*20)}),v.mat==0?r(X.grava[5],{k:f(m*1600)}):'')},
maceta(v){const s=v.d<20;return B(r(X.maceta[3],{a:f(v.d+(s?2:4)),b:f(v.d+(s?4:8))}))+S(X.maceta[4])},
test(v){const R=['bajo','medio','alto'],luz=['sol','semi','sombra'][v.b],okL=p=>p[2].split(' ').includes(luz),okP=p=>v.c==1||p[4]==='si';
let c=H.P.filter(p=>okL(p)&&okP(p)&&R.indexOf(p[3])<=v.a);if(!c.length)c=H.P.filter(p=>okL(p)&&okP(p));if(!c.length)c=H.P.filter(okL);
c.sort((a,b)=>Math.abs(R.indexOf(a[3])-v.a)-Math.abs(R.indexOf(b[3])-v.a));const p=c[0];return S(X.test[5])+B(p[0],p[1])}
};
document.querySelectorAll('input[type=date]').forEach(i=>i.valueAsDate=new Date());
document.querySelectorAll('.tool').forEach(el=>{const run=()=>{const v={};el.querySelectorAll('input,select').forEach(i=>v[i.name]=i.type==='date'?i.value:(Number(i.value)||0));try{el.querySelector('.res').innerHTML=F[el.dataset.tool](v)}catch(e){}};el.addEventListener('input',run);el.addEventListener('change',run);run()});`;
}

function presupuesto(lang) {
  const p = G[lang].pre;
  return `<section id="presupuesto" style="padding:70px 0 0"><div class="wrap"><div class="pre rv"><div><div class="eyebrow">${p[0]}</div><h2>${p[1]}</h2><p>${p[2]}</p><p class="nota">${p[12]}</p></div>
<form id="fpre" class="campos"><label>${p[3]}<input name="nombre" required autocomplete="name"></label><label>${p[4]}<input name="zona" autocomplete="address-level2"></label>
<label>${p[5]}<select name="tipo">${p[6].map((o) => `<option>${o}</option>`).join("")}</select></label><label>${p[7]}<select name="tam">${p[8].map((o) => `<option>${o}</option>`).join("")}</select></label>
<label class="ancho">${p[9]}<textarea name="desc" rows="4"></textarea></label>
${LEGAL_LISTO ? `<p class="ancho nota" style="margin:0">${legalTxt(lang, LEGAL[lang].aviso)}</p>` : ""}<div class="ancho canales">${TEL ? `<button type="submit" class="canal wa">${ICO.chat}<span>${p[10]}</span></button>` : ""}<button type="button" class="canal mail" id="pmail">${ICO.mail}<span>${p[11]}</span></button></div></form></div></div></section>`;
}
function preJs(lang) {
  return `const PR=${JSON.stringify(G[lang].pre).replace(/</g, "\\u003c")},fp=document.getElementById('fpre');
const ptxt=()=>{const d=new FormData(fp);return PR[13]+'.\\n\\n'+PR[3]+': '+d.get('nombre')+'\\n'+PR[4]+': '+d.get('zona')+'\\n'+PR[5]+': '+d.get('tipo')+'\\n'+PR[7]+': '+d.get('tam')+'\\n\\n'+d.get('desc')};
fp.onsubmit=e=>{e.preventDefault();if(!fp.reportValidity())return;window.open('https://wa.me/${TEL}?text='+encodeURIComponent(ptxt()),'_blank','noopener')};
document.getElementById('pmail').onclick=()=>{if(!fp.reportValidity())return;location.href='mailto:${EMAIL}?subject='+encodeURIComponent(PR[0])+'&body='+encodeURIComponent(ptxt())};`;
}
{
  const contacto = CUERPOS["/contacto"];
  CUERPOS["/contacto"] = (t, lang) => contacto(t, lang).replace('<section id="preguntas"', presupuesto(lang) + '\n<section id="preguntas"');
}
const legalTxt = (lang, s) => s.replace(/\{(\w)\}/g, (_, k) => ({ T: TITULAR.nombre, N: TITULAR.nif, D: TITULAR.dir, E: `<a href="mailto:${EMAIL}">${EMAIL}</a>`, W: "jardineriaadrover.es", L: u(lang, "/legal"), F: new Date(ACTUALIZADO).toLocaleDateString(T[lang].nj.loc, { day: "numeric", month: "long", year: "numeric" }) })[k] ?? _);

for (const l of IDIOMAS) T[l].meta["/legal"] = LEGAL[l].meta;
CUERPOS["/legal"] = (t, lang) => {
  const L = LEGAL[lang];
  return `${phead(FOTOS.galeria[7], L.ph)}
<section class="legal"><div class="wrap"><p class="nota" style="margin:0 0 30px">${legalTxt(lang, L.act)}</p>${L.sec.map(([h, ps]) => `<h2>${h}</h2>${ps.map((p) => `<p>${legalTxt(lang, p)}</p>`).join("")}`).join("")}</div></section>`;
};

// Tipografías servidas desde el propio dominio (sin conexión del visitante a Google)
const FUENTES_CSS = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap";
async function fuentes(path, env) {
  if (path === "/fonts/css") {
    let css = env.DATOS ? await env.DATOS.get("fonts:css") : null;
    if (!css) {
      const r = await fetch(FUENTES_CSS, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" } });
      if (!r.ok) return new Response("", { status: 502 });
      css = (await r.text()).replace(/https:\/\/fonts\.gstatic\.com\//g, "/fonts/f/");
      if (env.DATOS) await env.DATOS.put("fonts:css", css, { expirationTtl: 2592000 });
    }
    return new Response(css, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=604800" } });
  }
  const sub = path.slice("/fonts/f/".length);
  if (!/^[\w\-\/.]+\.woff2$/.test(sub) || sub.includes("..")) return new Response("No encontrada", { status: 404 });
  const h = { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable" };
  if (env.DATOS) { const v = await env.DATOS.get("font:" + sub, "arrayBuffer"); if (v) return new Response(v, { headers: h }); }
  const r = await fetch("https://fonts.gstatic.com/" + sub);
  if (!r.ok) return new Response("", { status: 502 });
  const buf = await r.arrayBuffer();
  if (env.DATOS) await env.DATOS.put("font:" + sub, buf);
  return new Response(buf, { headers: h });
}

function newsJs(t) {
  const nj = JSON.stringify(t.nj).replace(/</g, "\\u003c");
  return `const NJ=${nj};let D=null,cat='jardineria',n=9;const L=document.getElementById('lista');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hace=t=>{const m=(Date.now()-t)/6e4;if(m<60)return NJ.hace[0].replace('#',Math.max(1,m|0));const h=m/60;if(h<24)return NJ.hace[1].replace('#',h|0);const d=h/24;return d<30?NJ.hace[2].replace('#',d|0):new Date(t).toLocaleDateString(NJ.loc)};
function pinta(){const a=(D&&D[cat])||[];L.innerHTML=a.length?a.slice(0,n).map(x=>'<a class="n" target="_blank" rel="noopener" href="'+(/^https?:[/][/]/.test(x.enlace)?esc(x.enlace):'#')+'"><div class="meta"><span class="chip'+(x.idioma==='en'?' en':'')+'">'+(x.idioma==='en'?'EN':(cat==='ciencia'?NJ.tabs[1]:cat==='baleares'?NJ.tabs[2]:NJ.tabs[0]))+'</span><span>'+esc(x.fuente)+'</span><span>· '+hace(x.fecha)+'</span></div><h3>'+esc(x.titulo)+'</h3>'+(x.resumen?'<p>'+esc(x.resumen)+'</p>':'')+'</a>').join(''):'<p>'+NJ.vacio+'</p>';
document.getElementById('mas').style.display=a.length>n?'':'none'}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));b.classList.add('on');cat=b.dataset.c;n=9;pinta()});
document.getElementById('mas').onclick=()=>{n+=9;pinta()};
fetch('/api/noticias').then(r=>r.json()).then(d=>{D=d;document.getElementById('act').textContent=NJ.activo+hace(d.actualizado);pinta()}).catch(()=>{document.getElementById('act').textContent=NJ.error;});`;
}

// Vista previa al compartir el enlace (WhatsApp, Facebook…) y ficha de la empresa para Google.
const DOMINIO = "https://jardineriaadrover.es";
const OG_LOCALE = { es: "es_ES", ca: "ca_ES", en: "en_GB", de: "de_DE" };
const NEGOCIO = JSON.stringify({
  "@context": "https://schema.org", "@type": ["LocalBusiness", "GardenStore"], "@id": DOMINIO + "/#empresa",
  name: "Jardinería Adrover", legalName: "Zones Verdes S.L.", url: DOMINIO + "/", email: EMAIL,
  telephone: ["+34 " + TEL_FIJO, "+" + TEL], image: DOMINIO + img(FOTOS.hero, 1600), logo: DOMINIO + "/icon-512.png",
  address: { "@type": "PostalAddress", streetAddress: "Ctra. Son Servera-Capdepera, km 11,600", postalCode: "07580", addressLocality: "Capdepera", addressRegion: "Illes Balears", addressCountry: "ES" },
  areaServed: "Mallorca",
}).replace(/</g, "\\u003c");
function compartir(lang, ruta, titulo, desc) {
  const url = DOMINIO + u(lang, ruta);
  return `<meta property="og:type" content="website"><meta property="og:site_name" content="Jardinería Adrover"><meta property="og:locale" content="${OG_LOCALE[lang]}">
<meta property="og:title" content="${titulo}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${DOMINIO}${img(FOTOS.hero, 1600)}"><meta name="twitter:card" content="summary_large_image">
${ruta === "/" ? `<script type="application/ld+json">${NEGOCIO}</script>` : ""}`;
}

function pagina(lang, ruta, origin) {
  const t = T[lang];
  const [titulo, desc] = t.meta[ruta];
  const alt = IDIOMAS.map((l) => `<link rel="alternate" hreflang="${l}" href="${origin}${u(l, ruta)}">`).join("") + `<link rel="alternate" hreflang="x-default" href="${origin}${u("es", ruta)}">`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${desc}">${alt}<link rel="canonical" href="https://jardineriaadrover.es${u(lang, ruta)}">
${cabeceraIconos("Adrover")}
${compartir(lang, ruta, titulo, desc)}
<link href="/fonts/css" rel="stylesheet">
<style>
:root{--verde:#1f3d2b;--verde2:#2f5d3f;--hoja:#7fae6a;--crema:#f6f2ea;--arena:#e9e1d1;--tinta:#1b1f1c;--gris:#5d665f;--blanco:#fff}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--tinta);background:var(--crema);line-height:1.6}
img{max-width:100%;display:block}a{color:inherit}
.wrap{max-width:1200px;margin:0 auto;padding:0 20px}
h1,h2,h3{font-family:Fraunces,Georgia,serif;font-weight:600;line-height:1.1;margin:0;overflow-wrap:break-word;hyphens:auto}
.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;font-weight:600;color:var(--verde2)}
header.nav{position:fixed;inset:0 0 auto;z-index:50;transition:.3s;color:#fff}
header.nav.solid{background:rgba(246,242,234,.96);backdrop-filter:blur(8px);color:var(--tinta);box-shadow:0 1px 0 rgba(0,0,0,.06)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:88px}
.logo{display:flex;align-items:center;gap:14px;text-decoration:none}.logo svg{width:60px;height:60px;flex:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.18));transition:transform .4s}.logo:hover svg{transform:rotate(-8deg) scale(1.05)}.logo b{display:block;font-family:Fraunces,serif;font-weight:600;font-size:1.85rem;letter-spacing:.08em;line-height:1}.logo i{display:block;font-family:Fraunces,serif;font-style:italic;font-weight:400;font-size:1.3rem;letter-spacing:.02em;line-height:1;margin-bottom:5px;opacity:.92}@media(max-width:600px){.logo svg{width:48px;height:48px}.logo b{font-size:1.45rem}.logo i{font-size:1.05rem}}
nav a{text-decoration:none;margin-left:26px;font-weight:500;font-size:.95rem;opacity:.9}nav a:hover{opacity:1;color:var(--hoja)}
.btn{display:inline-block;background:var(--hoja);color:#10220f;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:600;transition:.2s;border:0;cursor:pointer}
.btn:hover{transform:translateY(-2px);background:#93c27d}.btn.lin{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.7);margin-left:10px}
.hero{min-height:100vh;position:relative;display:flex;align-items:flex-end;color:#fff;overflow:hidden}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04)}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,25,15,.35) 0%,rgba(10,25,15,.15) 40%,rgba(10,25,15,.8) 100%)}
.hero .wrap{position:relative;z-index:2;padding-bottom:12vh}
.hero h1{font-size:clamp(2.6rem,7vw,5.6rem);max-width:13ch;margin:14px 0 20px}
.hero p{font-size:1.15rem;max-width:52ch;opacity:.92;margin:0 0 30px}.hero .eyebrow{color:#cfe6c2}
.cifras{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--arena);border-radius:18px;overflow:hidden;margin-top:-48px;position:relative;z-index:5;box-shadow:0 20px 50px rgba(0,0,0,.08)}
.cifras div{background:#fff;padding:26px}.cifras b{font-family:Fraunces,serif;font-size:2rem;color:var(--verde);display:block}.cifras span{color:var(--gris);font-size:.92rem}
section{padding:110px 0}
.cab{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:48px;flex-wrap:wrap}.cab h2{font-size:clamp(2rem,4vw,3.2rem);max-width:16ch;margin-top:10px}.cab p{max-width:46ch;color:var(--gris);margin:0}
.serv{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.card{background:#fff;border-radius:20px;overflow:hidden;transition:.3s;box-shadow:0 1px 0 rgba(0,0,0,.04)}.card:hover{transform:translateY(-6px);box-shadow:0 24px 50px rgba(31,61,43,.14)}
.card img{aspect-ratio:4/3;object-fit:cover;width:100%}.card div{padding:22px 22px 26px}.card h3{font-size:1.35rem;margin-bottom:8px}.card p{margin:0;color:var(--gris);font-size:.95rem}
.split{display:grid;grid-template-columns:1.1fr 1fr;gap:60px;align-items:center}.split img{border-radius:24px;aspect-ratio:4/5;object-fit:cover;width:100%}
.split h2{font-size:clamp(2rem,4vw,3rem);margin:12px 0 20px}.split ul{padding:0;list-style:none;margin:26px 0 34px}.split li{padding:12px 0 12px 34px;border-bottom:1px solid var(--arena);position:relative}
.split li:before{content:"";position:absolute;left:4px;top:19px;width:14px;height:14px;border-radius:50% 0;background:var(--hoja)}
.oscuro{background:var(--verde);color:#fff}.oscuro .eyebrow{color:#a9d39a}.oscuro .cab p{color:#c5d3c8}
.galeria{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:170px;gap:12px;grid-auto-flow:dense}
.galeria figure{margin:0;border-radius:14px;overflow:hidden}.galeria img{width:100%;height:100%;object-fit:cover;transition:.6s}.galeria figure:hover img{transform:scale(1.07)}
.g0{grid-column:span 2;grid-row:span 2}.g3{grid-column:span 2}.g6{grid-row:span 2}.g7{grid-column:span 2;grid-row:span 2}.g10{grid-column:span 2}
.tabs{display:flex;gap:8px;margin-bottom:30px;flex-wrap:wrap}.tab{border:1.5px solid var(--verde2);background:transparent;color:var(--verde2);padding:10px 20px;border-radius:999px;font-weight:600;cursor:pointer;font-family:inherit}
.tab.on{background:var(--verde2);color:#fff}
.news{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.n{background:#fff;border-radius:18px;padding:24px;text-decoration:none;display:flex;flex-direction:column;gap:10px;transition:.25s;border:1px solid transparent}
.n:hover{border-color:var(--hoja);transform:translateY(-3px)}.n h3{font-size:1.12rem;font-family:Inter,sans-serif;font-weight:600;line-height:1.35}
.n p{margin:0;color:var(--gris);font-size:.9rem}.meta{display:flex;gap:10px;font-size:.78rem;color:var(--gris);align-items:center;flex-wrap:wrap}
.chip{background:var(--arena);padding:3px 10px;border-radius:999px;font-weight:600;color:var(--verde)}.en{background:#dfe9f5;color:#244766}
.vig{display:flex;align-items:center;gap:10px;font-size:.9rem;color:var(--gris)}.dot{width:9px;height:9px;border-radius:50%;background:#45b34a;box-shadow:0 0 0 0 rgba(69,179,74,.6);animation:p 2s infinite}
@keyframes p{70%{box-shadow:0 0 0 10px rgba(69,179,74,0)}100%{box-shadow:0 0 0 0 rgba(69,179,74,0)}}
.mas{text-align:center;margin-top:36px}.mas .btn{background:var(--verde2);color:#fff}
.contacto{display:grid;grid-template-columns:1fr 1fr;gap:0;border-radius:28px;overflow:hidden;background:var(--verde);color:#fff}
.contacto>div{padding:60px}.contacto img{width:100%;height:100%;object-fit:cover;min-height:420px}.contacto h2{font-size:clamp(2rem,4vw,3rem);margin:12px 0 18px}
.contacto p{color:#c5d3c8}.contacto .eyebrow{color:#a9d39a}.datos a{display:block;font-size:1.15rem;margin:8px 0;text-decoration:none;color:#fff}
footer{padding:40px 0;color:var(--gris);font-size:.9rem}footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.rv{opacity:0;transform:translateY(30px);transition:1s cubic-bezier(.2,.7,.2,1)}.rv.in{opacity:1;transform:none}.card ul{list-style:none;padding:14px 0 0;margin:14px 0 0;border-top:1px solid var(--arena);font-size:.9rem}.card li{padding:4px 0 4px 20px;position:relative}.card li:before{content:"";position:absolute;left:2px;top:12px;width:8px;height:8px;border-radius:50% 0;background:var(--hoja)}.suave{background:#efe8da}.pasos{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}.paso{background:#fff;border-radius:20px;padding:28px}.paso span{font-family:Fraunces,serif;font-size:2.4rem;color:var(--hoja);font-weight:600;line-height:1}.paso h3{font-size:1.3rem;margin:14px 0 8px}.paso p{margin:0;color:var(--gris);font-size:.95rem}.faqw{display:grid;grid-template-columns:1fr 1.4fr;gap:60px;align-items:start}.faqw h2{font-size:clamp(2rem,4vw,3rem);margin:12px 0 16px}.faq details{background:#fff;border-radius:16px;padding:20px 24px;margin-bottom:12px}.faq summary{cursor:pointer;font-weight:600;list-style:none;position:relative;padding-right:30px}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:"+";position:absolute;right:0;top:-4px;font-size:1.5rem;color:var(--verde2);transition:.3s}.faq details[open] summary:after{transform:rotate(45deg)}.faq details p{margin:12px 0 0;color:var(--gris)}@media(max-width:980px){.pasos{grid-template-columns:repeat(2,1fr)}.faqw{grid-template-columns:1fr;gap:30px}}@media(max-width:600px){.pasos{grid-template-columns:1fr}}.canales{display:flex;flex-wrap:wrap;gap:10px}.canal{display:inline-flex;align-items:center;gap:9px;padding:13px 22px;border-radius:999px;font-weight:600;text-decoration:none;transition:.2s;background:#fff;color:var(--verde)}.canal svg{width:20px;height:20px}.canal:hover{transform:translateY(-2px)}.canal.wa{background:#1b7f45;color:#fff}.canal.sms{background:var(--hoja);color:#10220f}.flotante{position:fixed;right:20px;bottom:20px;z-index:60;width:60px;height:60px;border-radius:50%;background:#25a35a;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:.2s}.flotante:hover{transform:scale(1.08)}.flotante svg{width:30px;height:30px}@media(max-width:600px){html,body{overflow-x:hidden}header .wrap{height:72px}nav .btn{padding:9px 16px!important;font-size:.85rem}.wrap .cifras{grid-template-columns:1fr;margin-top:-30px}.cifras div{padding:20px 22px}.cifras b{font-size:1.45rem;margin-bottom:4px}.hero h1{font-size:2.6rem}.hero p{font-size:1.02rem}.cab h2,.split h2,.faqw h2,.contacto h2{font-size:2.1rem}.cab{margin-bottom:32px}.canal{flex:1 1 auto;justify-content:center}.flotante{width:54px;height:54px;right:14px;bottom:14px}}
@media(max-width:980px){.serv{grid-template-columns:repeat(2,1fr)}.news{grid-template-columns:repeat(2,1fr)}.split,.contacto{grid-template-columns:1fr}.cifras{grid-template-columns:repeat(2,1fr)}.galeria{grid-template-columns:repeat(3,1fr)}}
@media(max-width:600px){.serv,.news{grid-template-columns:1fr}section{padding:72px 0}.contacto>div{padding:34px 24px}.galeria{grid-template-columns:repeat(2,1fr);grid-auto-rows:140px}.g7,.g0{grid-column:span 2}.btn.lin{margin:10px 0 0}}
.phead{min-height:56vh;position:relative;display:flex;align-items:flex-end;color:#fff;overflow:hidden;padding:0}.phead img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.phead:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,25,15,.45),rgba(10,25,15,.25) 45%,rgba(10,25,15,.82))}.phead .wrap{position:relative;z-index:2;padding-bottom:56px;padding-top:120px}.phead h1{font-size:clamp(2.4rem,6vw,4.4rem);margin:12px 0 16px;max-width:16ch}.phead p{max-width:58ch;font-size:1.1rem;opacity:.92;margin:0}.phead .eyebrow{color:#cfe6c2}nav a.on{color:var(--hoja);opacity:1}nav{display:flex;align-items:center}.menu{display:none;background:none;border:0;color:inherit;cursor:pointer;padding:8px;margin-right:-8px}.menu svg{width:30px;height:30px}.accesos{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.acceso{text-decoration:none;display:flex;flex-direction:column}.acceso>div{flex:1;display:flex;flex-direction:column}.acceso p{flex:1}.acceso .ver{align-self:flex-start}.acceso .ver{display:inline-block;margin-top:14px;font-weight:600;color:var(--verde2)}.cta{background:var(--verde);color:#fff;border-radius:28px;padding:56px;display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center}.cta h2{font-size:clamp(1.9rem,4vw,2.8rem);margin:10px 0 14px}.cta p{color:#c5d3c8;margin:0}.cta .eyebrow{color:#a9d39a}@media(max-width:980px){.menu{display:flex}nav{display:none;position:absolute;top:100%;left:0;right:0;background:var(--crema);color:var(--tinta);flex-direction:column;align-items:stretch;padding:8px 20px 22px;box-shadow:0 20px 40px rgba(0,0,0,.12)}header.abierto nav{display:flex}nav a{margin:0;padding:13px 0;border-bottom:1px solid var(--arena);font-size:1.05rem}nav a.btn{margin-top:14px;text-align:center;border:0;padding:14px!important}.accesos{grid-template-columns:1fr}.cta{grid-template-columns:1fr;padding:36px 26px}}footer{padding:70px 0 40px}footer .wrap{display:block}.cita{margin:0 auto 40px;max-width:620px;text-align:center;font-family:Fraunces,serif;font-style:italic;font-size:1.3rem;line-height:1.6;color:var(--verde)}.cita cite{display:block;margin-top:14px;font-family:Inter,sans-serif;font-style:normal;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gris)}.pie{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-top:1px solid var(--arena);padding-top:22px}@media(max-width:600px){.cita{font-size:1.1rem}}.langs{display:inline-flex;gap:2px;margin-left:22px;background:rgba(255,255,255,.14);border-radius:999px;padding:3px}.langs a{margin:0!important;padding:5px 9px;border-radius:999px;font-size:.78rem;font-weight:600;opacity:.85}.langs a.on{background:var(--hoja);color:#10220f;opacity:1}header.nav.solid .langs{background:var(--arena)}.pie{padding-right:70px}@media(max-width:980px){.langs{margin:14px 0 0;justify-content:center;background:var(--arena)}.langs a{padding:10px 16px!important;border:0!important;font-size:.95rem!important}}.hero .wrap{padding-top:130px}
[hidden]{display:none!important}
.hero .wrap,.phead .wrap{width:100%;min-width:0}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.rv{opacity:1;transform:none;transition:none}.dot{animation:none}}
.legal .wrap{max-width:860px}
.legal h2{font-size:clamp(1.6rem,3vw,2.1rem);margin:44px 0 16px}
.legal h2:first-of-type{margin-top:0}
.legal p{color:var(--gris);margin:0 0 14px}
.legal b{color:var(--tinta)}
.legal a,.pre .nota a,.pie a{color:var(--verde2)}
.subnav{position:sticky;top:88px;z-index:40;background:#fff;border-bottom:1px solid var(--arena)}
.subnav .wrap{display:flex;gap:6px;overflow-x:auto;padding-top:10px;padding-bottom:10px;scrollbar-width:none}
.subnav a{white-space:nowrap;text-decoration:none;padding:8px 16px;border-radius:999px;font-weight:600;font-size:.9rem;color:var(--verde2)}
.subnav a:hover{background:var(--arena)}
.mes{background:#fff;border-radius:20px;padding:30px 34px}
.mes h3{font-size:1.8rem;margin-bottom:16px}
.mes ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.mes li{background:var(--crema);border-radius:14px;padding:18px 18px 18px 44px;position:relative}
.mes li:before{content:"";position:absolute;left:18px;top:25px;width:12px;height:12px;border-radius:50% 0;background:var(--hoja)}
.filtros{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;align-items:center}
.filtros input,.filtros select,.campos input,.campos select,.campos textarea{font:inherit;font-weight:400;padding:11px 14px;border:1.5px solid var(--arena);border-radius:12px;background:#fff;color:var(--tinta);width:100%}
.filtros input[type=search]{flex:1 1 220px;width:auto}
.filtros select{width:auto}
.chk{display:inline-flex;align-items:center;gap:8px;font-weight:500;background:#fff;padding:10px 14px;border-radius:12px;cursor:pointer}
.filtros .chk input{accent-color:var(--verde2);width:18px;height:18px;padding:0}
.plantas{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.pl{background:#fff;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:8px}
.pl h3{font-size:1.3rem}
.pl i{color:var(--gris);font-size:.88rem}
.pl p{margin:0;color:var(--gris);font-size:.93rem;flex:1}
.chip.bien{background:#dcefd3;color:#24572c}
.chip.mal{background:#f6dcd5;color:#8a2f1d}
.chip.auto{background:var(--verde2);color:#fff}
.nota{font-size:.85rem;color:var(--gris);margin-top:18px}
#doctor .canal{margin-top:14px}
.faq details p b{color:var(--verde)}
.oscuro .paso{color:var(--tinta)}
.paso.poli{background:var(--hoja)}
.poli p{color:#1b2e1a}
.poli .btn{background:var(--verde);color:#fff;margin-top:16px}
.grupo{margin:60px 0 22px;font-size:clamp(1.6rem,3vw,2.2rem);scroll-margin-top:150px}
#g0{margin-top:0}
.tools{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.tool{background:#fff;border-radius:20px;padding:26px;display:flex;flex-direction:column}
.tool h3{font-size:1.35rem;margin-bottom:4px}
.tool>p{margin:0 0 16px;color:var(--gris);font-size:.93rem}
.campos{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start}
.campos label{display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font-size:.85rem;font-weight:600;color:var(--verde)}
.campos .ancho{grid-column:1/-1}
.tool .campos{margin-bottom:18px}
.res{margin-top:auto;background:var(--crema);border-radius:14px;padding:16px 18px;border-left:4px solid var(--hoja)}
.res b{display:block;font-family:Fraunces,serif;font-size:1.4rem;color:var(--verde);line-height:1.25}
.res span{display:block;color:var(--gris);font-size:.92rem;margin-top:4px}
.res small{display:block;color:var(--gris);font-size:.82rem;margin-top:6px}
.res small:first-child{margin:0 0 4px}
.res ul{margin:0;padding:0;list-style:none}
.res li{padding:3px 0}
.res li b{display:inline;font-size:1.1rem;margin-right:6px}
.pre{background:#fff;border-radius:28px;padding:50px;display:grid;grid-template-columns:1fr 1.3fr;gap:50px}
.pre h2{font-size:clamp(2rem,4vw,2.8rem);margin:12px 0 16px}
.pre p{color:var(--gris)}
.pre .canales button{font:inherit;font-weight:600;border:0;cursor:pointer}
.pre .canal.mail{border:1.5px solid var(--arena)}
#calendario,#plantas,#doctor,#xero{scroll-margin-top:140px}
@media(min-width:981px) and (max-width:1280px){nav a{margin-left:15px;font-size:.88rem}.langs{margin-left:12px}}
@media(max-width:980px){.plantas,.xero{grid-template-columns:repeat(2,1fr)}.mes ul{grid-template-columns:1fr}.tools,.pre{grid-template-columns:1fr}}
@media(max-width:600px){.plantas,.xero,.campos{grid-template-columns:1fr}.subnav{top:72px}.pre{padding:30px 22px}.tool{padding:22px}.mes{padding:24px 20px}}
</style><noscript><style>.rv{opacity:1;transform:none}</style></noscript></head><body>
<header class="nav" id="nav"><div class="wrap"><a class="logo" href="${u(lang, "/")}"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#1f3d2b"/><circle cx="24" cy="24" r="20.6" fill="none" stroke="#a9d39a" stroke-width=".7" opacity=".5"/><path d="M12.8 36.5C12.8 25 17.2 15.2 23.3 9.6c.5 10.4-2.6 20.2-10.5 26.9Z" fill="#a9d39a"/><path d="M35.2 36.5C35.2 25 30.8 15.2 24.7 9.6c-.5 10.4 2.6 20.2 10.5 26.9Z" fill="#7fae6a"/><path d="M14.5 34.5C17 27 20 19 23 12.5M33.5 34.5C31 27 28 19 25 12.5" stroke="#1f3d2b" stroke-width=".7" fill="none" opacity=".45" stroke-linecap="round"/><path d="M16.8 28.6c3.6-3.2 9.4-3.9 14.6-1.4-3.9 3.1-9.8 3.7-14.6 1.4Z" fill="#f6f2ea"/><path d="M14.5 39.6Q24 36.4 33.5 39.6" stroke="#f6f2ea" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg><span><i>Jardinería</i><b>ADROVER</b></span></a><button class="menu" id="menu" aria-label="${t.menu}" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><nav>${menu(lang, ruta, t)}</nav></div></header>

${CUERPOS[ruta](t, lang)}

${flotante(t)}
<footer><div class="wrap"><blockquote class="cita">${t.cita.join("<br>")}</blockquote><div class="pie"><span>© ${new Date().getFullYear()} Jardinería Adrover${LEGAL_LISTO ? ` · <a href="${u(lang, "/legal")}">${LEGAL[lang].pie}</a>` : ""}</span><span>${t.tag}</span></div></div></footer>
<script>
const nav=document.getElementById('nav');addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>40));
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const menuBtn=document.getElementById('menu'),cierra=()=>{nav.classList.remove('abierto');menuBtn.setAttribute('aria-expanded','false');nav.classList.toggle('solid',scrollY>40)};
menuBtn.onclick=()=>{if(nav.classList.contains('abierto'))return cierra();nav.classList.add('abierto','solid');menuBtn.setAttribute('aria-expanded','true')};
addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('abierto'))cierra()});
${ruta === "/noticias" ? newsJs(t) : ""}${ruta === "/guia" ? guiaJs() : ""}${ruta === "/herramientas" ? herrJs(lang) : ""}${ruta === "/contacto" ? preJs(lang) : ""}
</script></body></html>`;
}
const mesHoy = () => +new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid", month: "numeric" }) - 1;
const TEMPORADA = (m) => [11, 0, 1].includes(m) ? { a: "#c97b8b", b: "#3b4a5a", c: "#f3e9ec", n: { es: "Invierno", ca: "Hivern", en: "Winter", de: "Winter" } }
: m <= 4 ? { a: "#b07cc6", b: "#2f5d3f", c: "#f1ebf5", n: { es: "Primavera", ca: "Primavera", en: "Spring", de: "Frühling" } }
: m <= 7 ? { a: "#e0a030", b: "#1f5c6b", c: "#fbf2de", n: { es: "Verano", ca: "Estiu", en: "Summer", de: "Sommer" } }
: { a: "#c8693a", b: "#5a3a22", c: "#f7e9dc", n: { es: "Otoño", ca: "Tardor", en: "Autumn", de: "Herbst" } };
const plantaDelMes = (m = mesHoy()) => {
const [lat, porque] = PLANTA_MES[m];
return { p: PLANTAS_G.find((x) => x[0] === lat) || PLANTAS_G[0], porque };
};
const HOJA_SVG = `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 112C60 70 72 34 104 12 108 50 96 86 60 112Z" fill="currentColor" opacity=".9"/><path d="M60 112C60 76 46 44 16 26 12 62 26 92 60 112Z" fill="currentColor" opacity=".55"/><path d="M60 112C62 80 74 50 98 22M60 112C56 84 42 58 22 34" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/></svg>`;
function plantaMesHtml(lang) {
const m = mesHoy(), s = TEMPORADA(m), { p, porque } = plantaDelMes(m), g = G[lang], k = PM_T[lang];
const [nom, txt] = p[5][lang];
const chips = p[1].split(" ").map((x) => g.et[x]).concat(g.et[p[2]], p[4] ? g.et.auto : []).map((x) => `<span>${x}</span>`).join("");
return `<style>
.pm{--a:#2f5d3f;--b:#1f3d2b;--c:#e9efe6;position:relative;display:grid;grid-template-columns:1.05fr 1fr;border-radius:28px;overflow:hidden;background:var(--c);box-shadow:0 30px 60px -30px rgba(40,30,20,.35)}
.pm-arte{position:relative;min-height:340px;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.35),transparent 45%),linear-gradient(150deg,var(--a),var(--b));color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:34px}
.pm-arte svg{position:absolute;right:-6%;bottom:-8%;width:68%;color:rgba(255,255,255,.22);transform:rotate(-14deg);animation:pmMece 7s ease-in-out infinite}
@keyframes pmMece{50%{transform:rotate(-8deg) translateY(-6px)}}
.pm-mes{font-family:Fraunces,Georgia,serif;font-size:clamp(3rem,7vw,5.2rem);line-height:.9;font-weight:600;letter-spacing:-.02em;position:relative}
.pm-temp{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.18);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.35);padding:7px 14px;border-radius:999px;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:600;align-self:flex-start;position:relative}
.pm-temp:before{content:"";width:8px;height:8px;border-radius:50%;background:#fff}
.pm-txt{padding:40px 40px 36px;display:flex;flex-direction:column;gap:14px;justify-content:center}
.pm-txt .eyebrow{color:var(--a)}
.pm-txt h2{font-size:clamp(2rem,4vw,2.8rem);color:var(--b)}
.pm-txt i{color:var(--gris);font-size:.95rem;margin-top:-8px}
.pm-por{font-family:Fraunces,Georgia,serif;font-size:1.18rem;line-height:1.4;color:var(--b);border-left:3px solid var(--a);padding-left:14px;margin:4px 0}
.pm-txt p{margin:0;color:var(--gris)}
.pm-chips{display:flex;flex-wrap:wrap;gap:8px}.pm-chips span{background:#fff;color:var(--b);border:1px solid rgba(0,0,0,.06);padding:5px 12px;border-radius:999px;font-size:.8rem;font-weight:600}
.pm-acc{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;margin-top:6px}
.pm-acc .btn{background:var(--a);color:#fff}.pm-acc .btn:hover{background:var(--b)}
.pm-acc a.lnk{color:var(--b);font-weight:600;text-decoration:none;border-bottom:1.5px solid var(--a)}
@media(max-width:820px){.pm{grid-template-columns:1fr}.pm-arte{min-height:220px;padding:26px}.pm-txt{padding:28px 24px 30px}}
@media(prefers-reduced-motion:reduce){.pm-arte svg{animation:none}}.pm{--a:${s.a};--c:#f6efe7;max-width:880px;margin:0 auto;grid-template-columns:230px 1fr;border-radius:22px;box-shadow:0 18px 40px -28px rgba(40,30,20,.35)}.pm-arte{min-height:190px;padding:22px;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.3),transparent 45%),linear-gradient(150deg,${s.a},#9c4a22)}.pm-mes{font-size:clamp(1.9rem,3.6vw,2.5rem)}.pm-temp{font-size:.7rem;padding:5px 11px}.pm-txt{padding:24px 28px;gap:9px}.pm-txt h2{font-size:1.75rem}.pm-por{font-size:1.02rem}.pm-acc .btn{padding:11px 20px}@media(max-width:820px){.pm{grid-template-columns:1fr}.pm-arte{min-height:120px;padding:18px}.pm-txt{padding:20px}}
</style>
<section style="padding-top:0"><div class="wrap"><article class="pm rv">
<div class="pm-arte">${HOJA_SVG}<span class="pm-temp">${s.n[lang]}</span><div class="pm-mes">${g.mesesL[m]}</div></div>
<div class="pm-txt"><div class="eyebrow">${k.et}</div><h2>${nom}</h2><i>${p[0]}</i>
<p class="pm-por">${porque[lang]}</p><p>${txt}</p><div class="pm-chips">${chips}</div>
<div class="pm-acc">${TEL ? `<a class="btn" href="https://wa.me/${TEL}?text=${encodeURIComponent(k.msg + nom)}" target="_blank" rel="noopener">${k.btn}</a>` : ""}<a class="lnk" href="${u(lang, "/guia")}#plantas">${k.guia}</a></div></div>
</article></div></section>`;
}
{
const ini = CUERPOS["/"], viv = CUERPOS["/vivero"];
CUERPOS["/"] = (t, lang) => { const h = ini(t, lang), i = h.lastIndexOf('<section style="padding-top:0">'); return i < 0 ? h : h.slice(0, i) + plantaMesHtml(lang) + h.slice(i); };
CUERPOS["/vivero"] = (t, lang) => { const h = viv(t, lang), i = h.indexOf('<section id="galeria"'); return i < 0 ? h : h.slice(0, i) + plantaMesHtml(lang).replace('<section style="padding-top:0">', '<section>') + h.slice(i); };
}
const AV_T = {
  es: { tit: "Avisos de", toca: "Este mes en el jardín toca:", picudo: "\u{1F334} Picudo rojo: es temporada de tratamientos preventivos en palmeras. Si ves el cogollo caído o las hojas centrales torcidas, avísanos cuanto antes.", proce: "\u{1F41B} Procesionaria del pino: vigila los bolsones en los pinos y no dejes que perros ni niños se acerquen a las orugas.", planta: "\u{1F338} Planta del mes:", ayuda: "¿Necesitas ayuda? Escríbenos por aquí o llámanos al" },
  ca: { tit: "Avisos de", toca: "Aquest mes al jardí toca:", picudo: "\u{1F334} Morrut de les palmeres (picudo rojo): és temporada de tractaments preventius a les palmeres. Si veus el cabdell caigut o les fulles centrals tortes, avisa'ns com més aviat millor.", proce: "\u{1F41B} Processionària del pi: vigila les bosses als pins i no deixis que cans ni infants s'acostin a les erugues.", planta: "\u{1F338} Planta del mes:", ayuda: "Necessites ajuda? Escriu-nos per aquí o telefona'ns al" },
  };
  function avisoTexto(lang, m) {
  const g = G[lang], a = AV_T[lang], tareas = CAL_G[lang][m], { p, porque } = plantaDelMes(m);
  const yaPicudo = tareas.some((x) => /picudo|morrut/i.test(x));
  return [
  "\u{1F33F} *Jardinería Adrover · " + a.tit + " " + g.mesesL[m].toLowerCase() + "*", "",
  a.toca, ...tareas.map((x) => "• " + x), "",
  ...(m >= 2 && m <= 9 && !yaPicudo ? [a.picudo, ""] : []),
  ...(m <= 3 ? [a.proce, ""] : []),
  a.planta + " *" + p[5][lang][0] + "*. " + porque[lang], "",
  a.ayuda + " " + TEL_FIJO + ".",
  ].join("\n");
  }
  function avisos(url) {
    const q = +url.searchParams.get("m"), m = q >= 1 && q <= 12 ? q - 1 : mesHoy(), s = TEMPORADA(m);
    const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const bloques = ["es", "ca"].map((l) => { const tx = avisoTexto(l, m); return `<article class="av"><header><b>${l === "es" ? "Castellano" : "Català"}</b><div><button data-c="${l}">Copiar</button><a href="https://wa.me/?text=${encodeURIComponent(tx)}" target="_blank" rel="noopener">Enviar por WhatsApp</a></div></header><pre id="t-${l}">${esc(tx)}</pre></article>`; }).join("");
    const meses = G.es.mesesL.map((x, i) => `<a href="?m=${i + 1}"${i === m ? ' class="on"' : ""}>${x.slice(0, 3)}</a>`).join("");
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Avisos de temporada · Jardinería Adrover</title><link href="/fonts/css" rel="stylesheet">
    <style>:root{--a:${s.a};--b:${s.b};--c:${s.c}}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--c);color:#1b1f1c;line-height:1.5}
    .top{background:linear-gradient(140deg,var(--a),var(--b));color:#fff;padding:40px 20px 70px}.w{max-width:980px;margin:0 auto}
    h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(2rem,6vw,3.2rem);margin:6px 0 8px;line-height:1.05}.top p{margin:0;opacity:.9;max-width:620px}
    .k{text-transform:uppercase;letter-spacing:.14em;font-size:.75rem;font-weight:600;opacity:.85}
    .meses{display:flex;flex-wrap:wrap;gap:6px;margin-top:22px}.meses a{color:#fff;text-decoration:none;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.4);font-size:.85rem}.meses a.on{background:#fff;color:var(--b);font-weight:600}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:-44px;padding:0 20px 40px}
    .av{background:#fff;border-radius:22px;box-shadow:0 20px 40px -24px rgba(0,0,0,.35);overflow:hidden}
    .av header{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #eee}
    .av header div{display:flex;gap:8px;flex-wrap:wrap}.av button,.av a{font:inherit;font-size:.85rem;font-weight:600;border:0;border-radius:999px;padding:8px 14px;cursor:pointer;text-decoration:none}
    .av button{background:var(--c);color:var(--b)}.av a{background:#25d366;color:#fff}
    pre{white-space:pre-wrap;font-family:inherit;margin:0;padding:18px;background:#efeae2;font-size:.95rem}
    .nota{max-width:980px;margin:0 auto;padding:0 20px 50px;color:#5d665f;font-size:.9rem}
    @media(max-width:760px){.grid{grid-template-columns:1fr}}</style></head><body>
    <div class="top"><div class="w"><div class="k">Uso interno · ${s.n.es}</div><h1>Avisos de ${G.es.mesesL[m].toLowerCase()}</h1><p>Mensaje del mes preparado automáticamente con el calendario de la guía y la planta del mes. Pulsa «Enviar por WhatsApp» y elige tu lista de difusión.</p><nav class="meses">${meses}</nav></div></div>
    <div class="w grid">${bloques}</div>
    <p class="nota">Esta página no aparece en el menú ni en Google. Guárdala en favoritos en el móvil: cada mes el texto cambia solo.</p>
    <script>document.querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById('t-'+b.dataset.c).innerText);b.textContent='¡Copiado!';setTimeout(()=>b.textContent='Copiar',1800)}catch(e){alert('No se pudo copiar: selecciona el texto y cópialo a mano.')}})</script></body></html>`;
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
    }
    {
const base = pagina;
pagina = (lang, ruta, origin) => {
const css = `<style>.cta{background:none;color:var(--tinta);border-radius:0;padding:40px 0 0;border-top:1px solid var(--arena)}.cta p{color:var(--gris)}.cta .eyebrow{color:var(--verde2)}.cta .canal{border:1.5px solid var(--arena)}.hero .eyebrow,.phead .eyebrow{color:#f4e3cc}</style>`;
return base(lang, ruta, origin).replace("</head>", css + "</head>");
};
}
const LOC = { es: "es-ES", ca: "ca-ES", en: "en-GB", de: "de-DE" };
const HOJA_CAE = `<svg viewBox="0 0 40 40"><path d="M20 2c3 5 9 6 14 5-1 5 1 9 4 12-4 2-6 6-5 10-5-1-9 1-11 5h-4c-2-4-6-6-11-5 1-4-1-8-5-10 3-3 5-7 4-12 5 1 11 0 14-5z" fill="currentColor"/><path d="M20 8v30M20 20l-8-6M20 20l8-6M20 28l-6-4M20 28l6-4" stroke="rgba(0,0,0,.25)" stroke-width="1.2" fill="none"/></svg>`;
const PETALO = `<svg viewBox="0 0 40 40"><path d="M20 4c9 6 12 18 0 32C8 22 11 10 20 4z" fill="currentColor"/></svg>`;
function temporadaHtml(lang) {
const m = mesHoy(), s = TEMPORADA(m);
let f = new Date().toLocaleDateString(LOC[lang], { timeZone: "Europe/Madrid", weekday: "long", day: "numeric", month: "long" });
f = f.charAt(0).toUpperCase() + f.slice(1);
const forma = m >= 8 && m <= 10 ? HOJA_CAE : PETALO;
const css = `<style>
.tfecha{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;padding:8px 16px 8px 10px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(6px);color:#fff;font-size:.9rem;font-weight:500}
.tfecha em{font-style:normal;font-weight:700;color:var(--verde);background:#fff;padding:3px 10px;border-radius:999px;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
.tfecha svg{width:20px;height:20px;color:${s.a}}
</style>`;
return { css, fecha: `<div class="tfecha">${forma}<span>${f}</span><em>${s.n[lang]}</em></div>` };
}
{
const base = pagina;
pagina = (lang, ruta, origin) => {
const h = base(lang, ruta, origin), x = temporadaHtml(lang);
const re = /(<section class="(?:hero|phead)"[^>]*>)([\s\S]*?<div class="wrap">)/;
return re.test(h) ? h.replace("</head>", x.css + "</head>").replace(re, (_, a, b) => a + b + x.fecha) : h;
};
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.protocol === "http:" && !/^(localhost|127\.0\.0\.1)/.test(url.hostname)) { url.protocol = "https:"; return Response.redirect(url.toString(), 301); }
    if (url.pathname === "/manifest.webmanifest") return manifiesto("Jardinería Adrover", "Adrover", "/");
    const ico = icono(url.pathname, ICONOS); if (ico) return ico;
    if (url.pathname === "/avisos") return avisos(url); if (url.pathname === "/api/noticias") return noticias(env, ctx);
    if (url.pathname === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (url.pathname === "/sitemap.xml") {
      const hoy = new Date().toISOString().slice(0, 10);
      const urls = [...RUTAS, ...(LEGAL_LISTO ? ["/legal"] : [])].flatMap((r) => IDIOMAS.map((l) => `<url><loc>${url.origin}${u(l, r)}</loc><lastmod>${hoy}</lastmod>${IDIOMAS.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${url.origin}${u(x, r)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${url.origin}${u("es", r)}"/></url>`)).join("");
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8" } });
    }
    const m = url.pathname.match(/^\/img\/([\w-]+)$/);
    if (m) return imagen(m[1], +url.searchParams.get("w"), env, /image\/webp/.test(req.headers.get("accept") || ""));
    let p = url.pathname === "/index.html" ? "/" : url.pathname.replace(/\/+$/, "") || "/";
    let lang = "es";
    const lm = p.match(/^\/(ca|en|de)(\/.*)?$/);
    if (lm) { lang = lm[1]; p = lm[2] || "/"; }
    if (url.pathname.startsWith("/fonts/")) return fuentes(url.pathname, env);
    if (RUTAS.includes(p) || (p === "/legal" && LEGAL_LISTO))
      return new Response(pagina(lang, p, url.origin), { headers: {
        "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "x-frame-options": "SAMEORIGIN",
        // La copia en workers.dev no debe salir en Google: la buena es jardineriaadrover.es.
        ...(url.hostname.endsWith(".workers.dev") ? { "x-robots-tag": "noindex" } : {}),
      } });
    return Response.redirect(url.origin + u(lang, "/"), 302);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(vigilar(env)); },
};
