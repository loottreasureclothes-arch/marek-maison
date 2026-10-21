/* Menú de hamburguesa + chat de Soporte de Montaris (sin botón flotante: se abre desde la pestaña Soporte del menú o cualquier [data-mn-abrir="soporte"]).
   Requiere catalogo.js (const CAT) cargado antes. Engancha #btn-menu y #btn-soporte.
   Construye todo dentro de <div id="menu-root"></div> (si no existe, lo crea al final del body).
   API: window.MontarisMenu.abrirMenu(tab?) / abrirSoporte(tema?) / abrirChat(tema?) / cerrar() */

/* ===== Cerebro del chat =====
   Mientras MONTARIS_CHAT_API esté vacía, el chat contesta con el cerebro local (respuestas escritas abajo).
   Para enchufar Box Chat: pon aquí la URL de un endpoint del worker que reciba POST {mensaje, historial}
   y conteste {respuesta:"texto"} en la misma llamada (Box Chat hoy usa /web/message + /web/poll; basta un
   endpoint puente que haga las dos cosas y devuelva el texto). Si falla o tarda más de 12 s, cae al cerebro local. */
var MONTARIS_CHAT_API = window.MONTARIS_CHAT_API || '';

function preguntarAPI(texto, historial){
  if (!MONTARIS_CHAT_API || !window.fetch) return Promise.resolve(null);
  var ctl = window.AbortController ? new AbortController() : null;
  var t = setTimeout(function(){ if (ctl) ctl.abort(); }, 12000);
  return fetch(MONTARIS_CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje: texto, historial: historial || [] }),
    signal: ctl ? ctl.signal : undefined
  }).then(function(r){ if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function(d){ clearTimeout(t); return d && typeof d.respuesta === "string" && d.respuesta.trim() ? d.respuesta : null; })
    .catch(function(){ clearTimeout(t); return null; });
}

(function(){
  "use strict";
  var CATA = (typeof CAT !== "undefined" && Array.isArray(CAT)) ? CAT : [];
  var porId = {};
  CATA.forEach(function(p){ porId[p.id] = p; });

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function fotoGrande(id){ var p = porId[id]; return p ? "img/prod/" + p.carpeta + "/" + (p.fotos && p.fotos[0] || 1) + ".jpg" : ""; }
  function fotoCuadro(id){ var p = porId[id]; return p ? "img/prod/" + p.carpeta + "/c.jpg" : ""; }
  // primera pieza que cumpla el filtro (por si cambian los ids)
  function primera(f){ for (var i = 0; i < CATA.length; i++) if (f(CATA[i])) return CATA[i].id; return null; }
  function elegir(id, f){ return porId[id] ? id : primera(f); }
  function col(c, t){ return "coleccion.html?c=" + c + (t ? "&t=" + t : ""); }

  /* cuadritos por tipo dentro de Hombre/Mujer: solo los tipos que tienen piezas de ese género (?c=hombre&t=<sub>) */
  function porGenero(g, lista){
    return lista.filter(function(x){ return CATA.some(function(p){ return p.genero === g && p.sub === x[1]; }); })
      .map(function(x){ return { n:x[0], t:x[1], id: elegir(x[2], function(p){ return p.genero === g && p.sub === x[1]; }) }; });
  }
  // Colecciones: foto grande + cuadritos (fotos reales del catálogo)
  var COLS = [
    { k:"hombre", nombre:"Hombre", grande: elegir(51, function(p){return p.genero==="hombre";}), subs: porGenero("hombre", [
      ["Cartier","cartier",48], ["Cubanas (barbada)","barbada",50], ["Torzal","torzal",52], ["Marinera","marinera",46], ["Planchada","planchada",53],
      ["Esclavas con placa","placa",1], ["Tipo Rolex","rolex",30], ["Petatillo","petatillo",27], ["Pulsos","pulsos",31] ]) },
    { k:"mujer", nombre:"Mujer", grande: elegir(28, function(p){return p.genero==="mujer";}), subs: porGenero("mujer", [
      ["Delgadas","delgadas",38], ["Cartier","cartier",8], ["Zirconias (cubana)","cubana",28], ["Pulsos","pulsos",0], ["Planchada","planchada",0] ]) },
    { k:"cadenas", nombre:"Cadenas", grande: elegir(53, function(p){return p.coleccion==="cadenas";}), subs:[
      { n:"Cartier",   t:"cartier",   id: elegir(48, function(p){return p.coleccion==="cadenas"&&p.sub==="cartier";}) },
      { n:"Barbada",   t:"barbada",   id: elegir(50, function(p){return p.coleccion==="cadenas"&&p.sub==="barbada";}) },
      { n:"Torzal",    t:"torzal",    id: elegir(52, function(p){return p.coleccion==="cadenas"&&p.sub==="torzal";}) },
      { n:"Marinera",  t:"marinera",  id: elegir(46, function(p){return p.coleccion==="cadenas"&&p.sub==="marinera";}) },
      { n:"Planchada", t:"planchada", id: elegir(54, function(p){return p.coleccion==="cadenas"&&p.sub==="planchada";}) },
      { n:"Delgadas",  t:"delgadas",  id: elegir(37, function(p){return p.coleccion==="cadenas"&&p.sub==="delgadas";}) } ] },
    { k:"esclavas", nombre:"Esclavas", grande: elegir(27, function(p){return p.coleccion==="esclavas";}), subs:[
      { n:"Con placa",  t:"placa",     id: elegir(1,  function(p){return p.coleccion==="esclavas"&&p.sub==="placa";}) },
      { n:"Petatillo",  t:"petatillo", id: elegir(27, function(p){return p.coleccion==="esclavas"&&p.sub==="petatillo";}) },
      { n:"Tipo Rolex", t:"rolex",     id: elegir(30, function(p){return p.coleccion==="esclavas"&&p.sub==="rolex";}) },
      { n:"Barbada",    t:"barbada",   id: elegir(35, function(p){return p.coleccion==="esclavas"&&p.sub==="barbada";}) },
      { n:"Cartier",    t:"cartier",   id: elegir(36, function(p){return p.coleccion==="esclavas"&&p.sub==="cartier";}) } ] },
    { k:"pulseras", nombre:"Pulseras", grande: elegir(33, function(p){return p.coleccion==="pulseras";}), subs:[
      { n:"Pulsos",               t:"pulsos", id: elegir(31, function(p){return p.coleccion==="pulseras"&&p.sub==="pulsos";}) },
      { n:"De diseño",            t:"diseno", id: elegir(33, function(p){return p.coleccion==="pulseras"&&p.sub==="diseno";}) },
      { n:"Cubana con zirconias", t:"cubana", id: elegir(28, function(p){return p.coleccion==="pulseras"&&p.sub==="cubana";}) } ] }
  ];

  var X = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M13 13L1 1M13 1L1 13"/></svg>';
  var FLECHA = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2l5 5-5 5"/></svg>';

  function grande(href, id, nombre){
    var src = fotoGrande(id);
    return '<a class="mn-grande" href="' + href + '">' + (src ? '<img src="' + src + '" alt="" loading="lazy">' : '') +
      '<span>' + esc(nombre) + ' ›</span></a>';
  }
  function cuadro(href, id, nombre){
    var src = fotoCuadro(id);
    return '<a class="mn-cu" href="' + href + '"><span>' + (src ? '<img src="' + src + '" alt="" loading="lazy">' : '') + '</span><b>' + esc(nombre) + '</b></a>';
  }
  function piezas(f, n){ return CATA.filter(f).slice(0, n); }

  // cuadritos de una colección (Novedades, Regalos): por tipo si hay varios, si no por subcolección; llevan a coleccion.html?c=..&t=..
  var NOMS = { cadenas:"Cadenas", esclavas:"Esclavas", pulseras:"Pulseras", cartier:"Cartier", barbada:"Barbada", torzal:"Torzal", marinera:"Marinera", planchada:"Planchada", delgadas:"Delgadas", placa:"Con placa", petatillo:"Petatillo", rolex:"Tipo Rolex", cubana:"Cubana", pulsos:"Pulsos", diseno:"De diseño" };
  function porTipo(c, f){
    var l = CATA.filter(f), cols = [];
    l.forEach(function(p){ if (cols.indexOf(p.coleccion) < 0) cols.push(p.coleccion); });
    var campo = cols.length > 1 ? "coleccion" : "sub", ks = [];
    l.forEach(function(p){ if (ks.indexOf(p[campo]) < 0) ks.push(p[campo]); });
    var orden = ["cadenas","esclavas","pulseras","cartier","barbada","torzal","marinera","planchada","delgadas","placa","petatillo","rolex","cubana","pulsos","diseno"];
    ks.sort(function(a, b){ return orden.indexOf(a) - orden.indexOf(b); });
    return ks.slice(0, 6).map(function(k){
      var id = primera(function(p){ return f(p) && p[campo] === k; });
      return cuadro(col(c, k), id, NOMS[k] || k);
    }).join("");
  }
  /* ---------- MENÚ ---------- */
  var tabs = [], pans = [];
  COLS.forEach(function(c){
    tabs.push({ k:c.k, n:c.nombre });
    pans.push('<div class="mn-pan" role="tabpanel" id="mn-p-' + c.k + '" aria-labelledby="mn-t-' + c.k + '" hidden><h3>' + esc(c.nombre) + '</h3>' +
      grande(col(c.k), c.grande, "Ver " + c.nombre.toLowerCase()) +
      '<div class="mn-grid">' + c.subs.map(function(s){ return cuadro(col(c.k, s.t), s.id, s.n); }).join("") + '</div></div>');
  });
  var nuevos = piezas(function(p){ return (p.etiquetas||[]).indexOf("nuevo") > -1; }, 6);
  tabs.push({ k:"novedades", n:"Novedades" });
  pans.push('<div class="mn-pan" role="tabpanel" id="mn-p-novedades" aria-labelledby="mn-t-novedades" hidden><h3>Novedades</h3>' +
    grande(col("novedades"), nuevos[0] ? nuevos[0].id : 45, "Ver novedades") +
    '<div class="mn-grid">' + porTipo("novedades", function(p){ return (p.etiquetas||[]).indexOf("nuevo") > -1; }) + '</div></div>');
  var regalos = piezas(function(p){ return (p.etiquetas||[]).indexOf("regalo") > -1; }, 6);
  tabs.push({ k:"regalos", n:"Regalos" });
  pans.push('<div class="mn-pan" role="tabpanel" id="mn-p-regalos" aria-labelledby="mn-t-regalos" hidden><h3>Regalos</h3>' +
    grande(col("regalos"), elegir(16, function(p){return (p.etiquetas||[]).indexOf("regalo")>-1;}), "Ver regalos") +
    '<div class="mn-grid">' + porTipo("regalos", function(p){ return (p.etiquetas||[]).indexOf("regalo") > -1; }) + '</div></div>');
  tabs.push({ k:"mayoreo", n:"Mayoreo" });
  pans.push('<div class="mn-pan" role="tabpanel" id="mn-p-mayoreo" aria-labelledby="mn-t-mayoreo" hidden><h3>Mayoreo</h3>' +
    grande("index.html#mayoreo", elegir(51, function(){return true;}), "Mayoreo") +
    '<p class="mn-nota">Plata .925 con sello para revender. Te armamos tu pedido por volumen.</p>' +
    '<a class="mn-ver" href="index.html#mayoreo">Ver mayoreo</a></div>');

  /* orden del dueño: Hombre · Mujer · Novedades · Cadenas · Esclavas · Pulseras · Regalos · Mayoreo */
  (function(){ var orden=["hombre","mujer","novedades","cadenas","esclavas","pulseras","regalos","mayoreo"], par=tabs.map(function(t,i){return [t,pans[i]];});
    par.sort(function(a,b){ return orden.indexOf(a[0].k) - orden.indexOf(b[0].k); });
    tabs = par.map(function(x){return x[0];}); pans = par.map(function(x){return x[1];}); })();

  var ICO_ENVIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/></svg>';
  var ICO_MSI = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/></svg>';
  var ICO_GAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>';

  var menuHTML =
    '<div class="mn-capa mn-izq" id="mn-menu" aria-hidden="true">' +
      '<div class="mn-velo" data-mn-cerrar></div>' +
      '<div class="mn-panel" role="dialog" aria-modal="true" aria-label="Menú">' +
        '<div class="mn-top"><a class="mn-logo" href="index.html" aria-label="Montaris, inicio"><img src="img/logo-mm-negro.png" alt="" width="44" height="20"><b>MONTARIS</b></a>' +
          '<button class="mn-x" type="button" data-mn-cerrar aria-label="Cerrar menú">' + X + '</button></div>' +
        '<div class="mn-cuerpo">' +
          '<div class="mn-tabs" role="tablist" aria-orientation="vertical" aria-label="Colecciones">' +
            '<a class="mn-tab mn-inicio" href="index.html">Inicio</a>' +
            tabs.map(function(t){ return '<button class="mn-tab" type="button" role="tab" id="mn-t-' + t.k + '" aria-controls="mn-p-' + t.k + '" aria-selected="false" tabindex="-1" data-mn-tab="' + t.k + '">' + esc(t.n) + '</button>'; }).join("") +
            '<div class="mn-tab-sep" aria-hidden="true"></div>' +
            '<button class="mn-tab mn-sop" type="button" data-mn-abrir="soporte" aria-haspopup="dialog">Soporte</button>' +
          '</div>' +
          '<div class="mn-der-col">' + pans.join("") +
            '<div class="mn-conf"><p>' + ICO_ENVIO + 'Envío gratis desde $950</p><p>' + ICO_MSI + 'Hasta 6 meses sin intereses</p><p>' + ICO_GAR + 'Garantía 60 días · Sello .925</p></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';


  /* ---------- SOPORTE = CHAT ---------- */
  var ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var LINGOTE_MINI = '<span class="mn-lg mn-lg-mini" aria-hidden="true"><i>MM</i><em>.925</em></span>';

  var CHIPS = [
    { k:"envios",   n:"Envíos" },
    { k:"cambios",  n:"Cambios y devoluciones" },
    { k:"garantia", n:"Garantía" },
    { k:"largos",   n:"Guía de largos" },
    { k:"cuidado",  n:"Cuidado de la plata" },
    { k:"mayoreo",  n:"Mayoreo" },
    { k:"persona",  n:"Hablar con una persona" }
  ];
  function chip(k){ for (var i = 0; i < CHIPS.length; i++) if (CHIPS[i].k === k) return CHIPS[i]; return null; }

  /* respuestas del cerebro local. b = botones: clave de chip, "persona", "lista" o {n, href} */
  var R = {
    saludo: { t:'<p>Hola, soy el asistente de Montaris. ¿En qué te ayudo?</p>', chips:true },
    envios: { t:'<p><b>Envío gratis</b> en compras desde $950 a todo México.</p><p>Cada pieza va en su estuche con kit de limpieza y te mandamos la guía para que sigas tu paquete.</p>', b:["cambios","persona"] },
    cambios: { t:'<p>Tienes <b>30 días</b> desde que recibes tu pieza para cambiarla o devolverla.</p><p>Debe venir sin uso y con su estuche. Escríbenos con tu número de pedido y te decimos cómo mandarla.</p>', b:["largos","persona"] },
    garantia: { t:'<p>Todas las piezas tienen <b>garantía de 60 días</b> contra defectos de fabricación (broches, eslabones, soldaduras).</p><p>Cada pieza lleva el <b>sello .925</b> que confirma que es plata ley .925.</p>', b:["cuidado","persona"] },
    mancha: { t:'<p>Que la plata se oscurezca con el tiempo es normal: es el contacto con el aire, el sudor o el perfume, no quiere decir que no sea plata.</p><p>Se limpia con el <b>kit de limpieza</b> que viene con tu pieza. Y si es un defecto de fabricación (broche, eslabón, soldadura), tienes <b>garantía de 60 días</b>.</p>', b:["cuidado","persona"] },
    cuidado: { t:'<p>Para que tu plata dure brillante:</p><ul><li>Quítatela para bañarte, nadar o hacer ejercicio.</li><li>Evita perfume, cremas y cloro directo.</li><li>Guárdala en su estuche, separada de otras piezas.</li><li>Si se opaca, límpiala con el kit de limpieza que viene con tu pieza.</li></ul>', b:["garantia"] },
    largos: { t:'<p>Así queda cada largo de cadena:</p><ul><li><b>45–50 cm:</b> al cuello.</li><li><b>55 cm:</b> a la altura de la clavícula.</li><li><b>60 cm:</b> unos tres dedos abajo de la clavícula.</li><li><b>70 cm:</b> a la altura del esternón.</li></ul>', b:["cambios","persona"] },
    mayoreo: { t:'<p>Vendemos plata .925 con sello para revender, por escalones de compra: <b>$5,000 · $10,000 · $15,000 · $20,000</b>. Entre más grande el pedido, mejor precio.</p><p>La lista de precios te la mandamos por mensaje.</p>', b:["lista", { n:"Ver mayoreo", href:"index.html#mayoreo" }] },
    msi: { t:'<p>Puedes pagar <b>hasta en 6 meses sin intereses</b>.</p>', b:["envios","persona"] },
    precio: { t:'<p>Los precios están por confirmar; déjanos tu correo y te avisamos.</p>', b:["correo"] },
    nosotros: { t:'<p>Montaris lo hacemos cinco compas: plata .925 con sello, garantía de 60 días y envío gratis desde $950.</p>', chips:true },
    gracias: { t:'<p>¡Con gusto! Si se te ofrece algo más, aquí estoy.</p>', chips:true },
    nose: { t:'<p>No te entendí bien. Elige un tema o escríbelo de otra forma:</p>', chips:true }
  };

  function norm(s){ return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  /* buscador de intención por palabras clave; el orden importa */
  var INTENT = [
    ["persona",  /\b(humano|persona|alguien|asesor|agente|hablar con)\b/],
    ["mayoreo",  /(mayoreo|revend|reventa|por mayor|lista de precio|\blista\b|negocio|distribu)/],
    ["precio",   /(precio|cuesta|costo|\bvale\b|cuanto (es|sale|seria|cobran|valen?))/],
    ["mancha",   /(manch|negr|oscur|se puso|cambio de color|despint|verde)/],
    ["garantia", /(garantia|defect|rompi|roto|se rompio|broche|sello|925|autentic|original|es plata)/],
    ["cambios",  /(cambi|devol|reembols|talla|no me queda|regresar)/],
    ["largos",   /(largo|\bcm\b|centimetr|medida|mide|cuello|clavicula|esternon)/],
    ["envios",   /(envio|enviar|entrega|llega|paquete|rastre|paqueteria|mandan|domicilio)/],
    ["cuidado",  /(cuid|limpi|bañ|ban(o|ar)|agua|perfume|nadar|brill|opac)/],
    ["msi",      /(meses|msi|pago|pagar|tarjeta|credito)/],
    ["nosotros", /(quien(es)? (son|eres|hace)|ustedes|nosotros|montaris)/],
    ["gracias",  /^(gracias|ok|okay|va|vale|perfecto|listo)\b/],
    ["saludo",   /^(hola|buenas|buen dia|buenos|que tal|hey)\b/]
  ];
  function intencion(txt){
    var n = norm(txt);
    for (var i = 0; i < INTENT.length; i++) if (INTENT[i][1].test(n)) return INTENT[i][0];
    return "nose";
  }

  var chatHTML =
    '<section class="mn-cb" id="mn-cb" role="dialog" aria-modal="false" aria-labelledby="mn-cb-titulo" aria-hidden="true">' +
      '<header class="mn-cb-top">' + LINGOTE_MINI +
        '<div class="mn-cb-tit"><h2 id="mn-cb-titulo">Montaris · Soporte</h2><p><span class="mn-punto" aria-hidden="true"></span>Responde al instante</p></div>' +
        '<button class="mn-x" type="button" data-mn-cb-cerrar aria-label="Cerrar chat">' + X + '</button>' +
      '</header>' +
      '<div class="mn-cb-msgs" id="mn-cb-msgs" role="log" aria-live="polite" aria-label="Conversación"></div>' +
      '<form class="mn-cb-form" id="mn-cb-form" autocomplete="off">' +
        '<label class="mn-sr" for="mn-cb-input">Escribe tu pregunta</label>' +
        '<input id="mn-cb-input" type="text" enterkeyhint="send" placeholder="Escribe tu pregunta…" maxlength="500">' +
        '<button class="mn-cb-enviar" type="submit" aria-label="Enviar">' + ENVIAR + '</button>' +
      '</form>' +
    '</section>';

  /* ---------- montaje y comportamiento ---------- */
  function montar(){
    var root = document.getElementById("menu-root");
    if (!root){ root = document.createElement("div"); root.id = "menu-root"; document.body.appendChild(root); }
    root.classList.add("mn-root");
    root.innerHTML = menuHTML + chatHTML;

    var capas = { menu: document.getElementById("mn-menu") };
    var botones = { menu: document.getElementById("btn-menu"), soporte: document.getElementById("btn-soporte") };
    var abierta = null, origen = null;

    Object.keys(botones).forEach(function(k){
      var b = botones[k]; if (!b) return;
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", k === "menu" ? "mn-menu" : "mn-cb");
      b.setAttribute("aria-haspopup", "dialog");
      b.addEventListener("click", function(e){ e.preventDefault(); abrir(k, null, b); });
    });

    /* cualquier botón con data-soporte (pestaña "Soporte", "Pedir la lista"...) abre el chat.
       data-soporte="mayoreo" (o el texto "lista") abre directo en ese tema */
    document.addEventListener("click", function(e){
      var t = e.target.closest ? e.target.closest("[data-soporte]") : null;
      if (!t || t.closest("#menu-root")) return;
      e.preventDefault();
      var tema = t.getAttribute("data-soporte") || (/lista/i.test(t.textContent) ? "mayoreo" : null);
      abrir("soporte", tema, t);
    });

    function focables(el){
      return Array.prototype.filter.call(el.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex="0"]'), function(n){ return n.offsetParent !== null; });
    }
    function abrir(k, extra, quien){
      if (k === "soporte"){ if (abierta) cerrar(true); abrirChat(extra, quien); return; }
      if (chatAbierto) cerrarChat(true);
      if (abierta && abierta !== k) cerrar(true);
      var capa = capas[k];
      origen = quien || document.activeElement;
      abierta = k;
      capa.classList.add("mn-on"); capa.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("mn-lock");
      if (botones[k]) botones[k].setAttribute("aria-expanded", "true");
      if (k === "menu") elegirTab(extra || tabActual || COLS[0].k, false);
      setTimeout(function(){ var x = capa.querySelector(".mn-x"); if (x) x.focus(); }, 30);
    }
    function cerrar(sinFoco){
      if (!abierta) return;
      var capa = capas[abierta];
      capa.classList.remove("mn-on"); capa.setAttribute("aria-hidden", "true");
      if (botones[abierta]) botones[abierta].setAttribute("aria-expanded", "false");
      abierta = null;
      document.documentElement.classList.remove("mn-lock");
      if (!sinFoco && origen && origen.focus && document.contains(origen)) origen.focus();
    }

    // pestañas
    var tabActual = null;
    function elegirTab(k, foco){
      tabActual = k;
      capas.menu.querySelectorAll("[data-mn-tab]").forEach(function(t){
        var on = t.getAttribute("data-mn-tab") === k;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && foco) t.focus();
      });
      capas.menu.querySelectorAll(".mn-pan").forEach(function(p){ p.hidden = p.id !== "mn-p-" + k; });
      var col = capas.menu.querySelector(".mn-der-col"); if (col) col.scrollTop = 0;
    }
    capas.menu.addEventListener("click", function(e){
      var t = e.target.closest("[data-mn-tab]");
      if (t){ elegirTab(t.getAttribute("data-mn-tab"), false); return; }
    });
    capas.menu.querySelector(".mn-tabs").addEventListener("keydown", function(e){
      if (["ArrowDown","ArrowUp","Home","End"].indexOf(e.key) < 0) return;
      var lista = Array.prototype.slice.call(capas.menu.querySelectorAll("[data-mn-tab]"));
      var i = lista.findIndex(function(t){ return t.getAttribute("aria-selected") === "true"; });
      if (e.key === "ArrowDown") i = (i + 1) % lista.length;
      if (e.key === "ArrowUp") i = (i - 1 + lista.length) % lista.length;
      if (e.key === "Home") i = 0;
      if (e.key === "End") i = lista.length - 1;
      e.preventDefault(); elegirTab(lista[i].getAttribute("data-mn-tab"), true);
    });

    /* ===================== CHAT ===================== */
    var cb = document.getElementById("mn-cb"), msgs = document.getElementById("mn-cb-msgs");
    var cbForm = document.getElementById("mn-cb-form"), cbInput = document.getElementById("mn-cb-input");
    var chatAbierto = false, chatOrigen = null, ocupado = false;
    var KEY_HIST = "montaris_chat", KEY_FORM = "montaris_soporte";
    var hist = [];
    try { hist = JSON.parse(sessionStorage.getItem(KEY_HIST) || "[]"); if (!Array.isArray(hist)) hist = []; } catch (e) { hist = []; }
    function guardar(){ try { sessionStorage.setItem(KEY_HIST, JSON.stringify(hist.slice(-60))); } catch (e) {} }
    var celular = window.matchMedia ? window.matchMedia("(max-width:600px)") : { matches:false };

    function botonHTML(b){
      if (typeof b === "object") return '<a class="mn-cb-chip" href="' + esc(b.href) + '">' + esc(b.n) + '</a>';
      if (b === "lista") return '<button class="mn-cb-chip mn-cb-chip-on" type="button" data-cb-form="mayoreo">Pedir la lista</button>';
      if (b === "correo") return '<button class="mn-cb-chip mn-cb-chip-on" type="button" data-cb-form="precio">Dejar mi correo</button>';
      var c = chip(b); return c ? '<button class="mn-cb-chip" type="button" data-cb-chip="' + c.k + '">' + esc(c.n) + '</button>' : '';
    }
    function chipsHTML(){ return CHIPS.map(function(c){ return botonHTML(c.k); }).join(""); }
    function formHTML(motivo){
      var msj = motivo === "mayoreo" ? "Quiero la lista de precios de mayoreo." : motivo === "precio" ? "Avísenme cuando estén los precios." : "";
      var id = "f" + Date.now().toString(36);
      return '<form class="mn-cb-mini" data-cb-mini novalidate>' +
        '<p>Déjanos tus datos y te contestamos por correo.</p>' +
        '<label for="' + id + 'n">Nombre</label><input id="' + id + 'n" name="nombre" type="text" autocomplete="name" required>' +
        '<label for="' + id + 'c">Correo</label><input id="' + id + 'c" name="correo" type="email" autocomplete="email" inputmode="email" required>' +
        '<label for="' + id + 'm">Mensaje</label><textarea id="' + id + 'm" name="mensaje" rows="3" required>' + esc(msj) + '</textarea>' +
        '<button class="mn-cb-mandar" type="submit">Enviar</button>' +
        '<p class="mn-cb-aviso" role="alert" hidden></p>' +
      '</form>';
    }
    function pintar(m){
      var d = document.createElement("div");
      d.className = "mn-cb-m " + (m.de === "yo" ? "mn-cb-yo" : "mn-cb-bot");
      if (m.de === "yo") d.innerHTML = '<div class="mn-cb-burbuja">' + esc(m.txt) + '</div>';
      else if (m.form) d.innerHTML = '<div class="mn-cb-burbuja">' + formHTML(m.form) + '</div>';
      else {
        var html = m.html || ('<p>' + esc(m.txt || "").replace(/\n+/g, "<br>") + '</p>');
        var bs = m.chips ? chipsHTML() : (m.b || []).map(botonHTML).join("");
        d.innerHTML = '<div class="mn-cb-burbuja">' + html + '</div>' + (bs ? '<div class="mn-cb-chips">' + bs + '</div>' : '');
      }
      msgs.appendChild(d);
      return d;
    }
    function bajar(){ msgs.scrollTop = msgs.scrollHeight; }
    function agregar(m){ hist.push(m); guardar(); var d = pintar(m); bajar(); return d; }
    function deLocal(k){ var r = R[k] || R.nose; return { de:"bot", html:r.t, b:r.b, chips:!!r.chips }; }

    var escribiendo = null;
    function puntos(on){
      if (on && !escribiendo){
        escribiendo = document.createElement("div");
        escribiendo.className = "mn-cb-m mn-cb-bot";
        escribiendo.innerHTML = '<div class="mn-cb-burbuja mn-cb-puntos" aria-label="Escribiendo"><i></i><i></i><i></i></div>';
        msgs.appendChild(escribiendo); bajar();
      } else if (!on && escribiendo){ escribiendo.remove(); escribiendo = null; }
    }
    function responderTema(k){
      if (k === "persona"){ agregar({ de:"bot", html:'<p>Claro, una persona del equipo te contesta por correo.</p>' }); agregar({ de:"bot", form:"persona" }); enfocarMini(); return; }
      agregar(deLocal(k));
    }
    function preguntar(texto, tema){
      if (ocupado) return;
      agregar({ de:"yo", txt:texto });
      ocupado = true; puntos(true);
      var historial = hist.slice(-12).map(function(m){ return { de:m.de, texto:m.txt || (m.html ? m.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "") }; });
      var api = tema ? Promise.resolve(null) : preguntarAPI(texto, historial);
      var minimo = new Promise(function(r){ setTimeout(r, 450); });
      Promise.all([api, minimo]).then(function(res){
        puntos(false); ocupado = false;
        if (res[0]) agregar({ de:"bot", txt:res[0] });
        else responderTema(tema || intencion(texto));
      });
    }
    function enfocarMini(){
      var f = msgs.querySelectorAll("[data-cb-mini]"); f = f[f.length - 1];
      if (f) setTimeout(function(){ f.nombre.focus({ preventScroll:true }); bajar(); }, 60);
    }

    // clics dentro del chat
    cb.addEventListener("click", function(e){
      if (e.target.closest("[data-mn-cb-cerrar]")){ cerrarChat(); return; }
      var c = e.target.closest("[data-cb-chip]");
      if (c){ var k = c.getAttribute("data-cb-chip"); preguntar(chip(k).n, k); return; }
      var f = e.target.closest("[data-cb-form]");
      if (f){
        if (ocupado) return;
        agregar({ de:"yo", txt:f.textContent });
        agregar({ de:"bot", form:f.getAttribute("data-cb-form") }); enfocarMini(); return;
      }
      if (e.target.closest("a.mn-cb-chip")) cerrarChat(true);
    });
    // mini formulario "hablar con una persona": guarda en localStorage y agradece
    cb.addEventListener("submit", function(e){
      var f = e.target.closest("[data-cb-mini]"); if (!f) return;
      e.preventDefault();
      var aviso = f.querySelector(".mn-cb-aviso");
      var campos = [f.nombre, f.correo, f.mensaje];
      for (var i = 0; i < campos.length; i++){
        if (!campos[i].value.trim() || !campos[i].checkValidity()){
          aviso.hidden = false;
          aviso.textContent = i === 1 && campos[i].value.trim() ? "Revisa tu correo, parece incompleto." : "Llena tu nombre, correo y mensaje.";
          campos[i].focus(); return;
        }
      }
      var dato = { nombre:f.nombre.value.trim(), correo:f.correo.value.trim(), mensaje:f.mensaje.value.trim(), pagina:location.pathname, fecha:new Date().toISOString() };
      try { var l = JSON.parse(localStorage.getItem(KEY_FORM) || "[]"); if (!Array.isArray(l)) l = []; l.push(dato); localStorage.setItem(KEY_FORM, JSON.stringify(l)); } catch (er) {}
      // el formulario se vuelve el agradecimiento (también en el historial)
      var nodo = f.closest(".mn-cb-m"), idx = Array.prototype.indexOf.call(msgs.children, nodo);
      var gracias = { de:"bot", html:'<p>¡Gracias, ' + esc(dato.nombre.split(" ")[0]) + '! Recibimos tu mensaje y te contestamos por correo a <b>' + esc(dato.correo) + '</b>.</p>' };
      if (idx > -1 && hist[idx] && hist[idx].form) hist[idx] = gracias; else hist.push(gracias);
      guardar();
      var nuevo = pintar(gracias); msgs.replaceChild(nuevo, nodo); // pintar() lo pone al final; replaceChild lo mueve a su lugar
      bajar(); cbInput.focus({ preventScroll:true });
    });
    cbForm.addEventListener("submit", function(e){
      e.preventDefault();
      var t = cbInput.value.trim(); if (!t || ocupado) return;
      cbInput.value = ""; preguntar(t, null);
    });

    function arrancar(){
      if (msgs.childElementCount) return;
      if (!hist.length){ hist.push({ de:"bot", html:R.saludo.t, chips:true }); guardar(); }
      hist.forEach(pintar);
    }
    function abrirChat(tema, quien){
      arrancar();
      if (!chatAbierto){
        chatOrigen = quien || document.activeElement;
        chatAbierto = true;
        cb.classList.add("mn-on"); cb.setAttribute("aria-hidden", "false");
        if (botones.soporte) botones.soporte.setAttribute("aria-expanded", "true");
        if (celular.matches) document.documentElement.classList.add("mn-lock");
      }
      if (tema && (R[tema] || tema === "persona")) preguntar(chip(tema) ? chip(tema).n : tema, tema);
      bajar();
      setTimeout(function(){ if (!msgs.querySelector("[data-cb-mini]:focus-within")) cbInput.focus({ preventScroll:true }); }, 60);
    }
    function cerrarChat(sinFoco){
      if (!chatAbierto) return;
      chatAbierto = false;
      cb.classList.remove("mn-on"); cb.setAttribute("aria-hidden", "true");
      if (botones.soporte) botones.soporte.setAttribute("aria-expanded", "false");
      if (!abierta) document.documentElement.classList.remove("mn-lock");
      if (!sinFoco){ var o = chatOrigen && document.contains(chatOrigen) && chatOrigen.offsetParent !== null ? chatOrigen : botones.menu; if (o && o.focus) o.focus(); }
    }
    // comunes: cerrar, abrir desde otros botones, enlaces que salen
    document.addEventListener("click", function(e){
      var c = e.target.closest("[data-mn-cerrar]");
      if (c && document.getElementById("menu-root").contains(c)){ cerrar(); return; }
      var a = e.target.closest("[data-mn-abrir]");
      if (a){ e.preventDefault(); abrir(a.getAttribute("data-mn-abrir"), a.getAttribute("data-mn-extra"), a); return; }
      var l = e.target.closest(".mn-root a[href]");
      if (l && abierta) cerrar(true); // al ir a otra parte (ej. index.html#faq en la misma página) se cierra
    });
    document.addEventListener("keydown", function(e){
      if (chatAbierto && e.key === "Escape"){ e.preventDefault(); cerrarChat(); return; }
      if (!abierta) return;
      if (e.key === "Escape"){ e.preventDefault(); cerrar(); return; }
      if (e.key === "Tab"){ // foco atrapado dentro del panel
        var f = focables(capas[abierta].querySelector(".mn-panel")); if (!f.length) return;
        var p = f[0], u = f[f.length - 1];
        if (e.shiftKey && document.activeElement === p){ e.preventDefault(); u.focus(); }
        else if (!e.shiftKey && document.activeElement === u){ e.preventDefault(); p.focus(); }
      }
    });

    window.MontarisMenu = {
      abrirMenu: function(tab){ abrir("menu", tab, botones.menu); },
      abrirSoporte: function(tema){ abrir("soporte", tema, botones.soporte); },
      abrirChat: function(tema){ abrir("soporte", tema, botones.menu); },
      cerrar: function(){ cerrar(); cerrarChat(); }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
})();
