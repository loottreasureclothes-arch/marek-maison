/* Menú de hamburguesa + panel de Soporte de Montaris.
   Requiere catalogo.js (const CAT) cargado antes. Engancha #btn-menu y #btn-soporte.
   Construye todo dentro de <div id="menu-root"></div> (si no existe, lo crea al final del body).
   API: window.MontarisMenu.abrirMenu(tab?) / abrirSoporte(seccion?) / cerrar() */
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

  // Colecciones: foto grande + cuadritos (fotos reales del catálogo)
  var COLS = [
    { k:"hombre", nombre:"Hombre", grande: elegir(51, function(p){return p.genero==="hombre";}), subs:[
      { n:"Cadenas",  t:"cadenas",  id: elegir(48, function(p){return p.genero==="hombre"&&p.coleccion==="cadenas";}) },
      { n:"Esclavas", t:"esclavas", id: elegir(36, function(p){return p.genero==="hombre"&&p.coleccion==="esclavas";}) },
      { n:"Pulseras", t:"pulseras", id: elegir(31, function(p){return p.genero==="hombre"&&p.coleccion==="pulseras";}) } ] },
    { k:"mujer", nombre:"Mujer", grande: elegir(28, function(p){return p.genero==="mujer";}), subs:[
      { n:"Cadenas delgadas",     t:"delgadas", id: elegir(38, function(p){return p.sub==="delgadas";}) },
      { n:"Cubana con zirconias", t:"cubana",   id: elegir(28, function(p){return p.sub==="cubana";}) },
      { n:"Cartier",              t:"cartier",  id: elegir(8, function(p){return p.genero==="mujer"&&p.sub==="cartier";}) } ] },
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
    '<div class="mn-grid">' + nuevos.map(function(p){ return cuadro("producto.html?id=" + p.id, p.id, p.nombre); }).join("") + '</div></div>');
  var regalos = piezas(function(p){ return (p.etiquetas||[]).indexOf("regalo") > -1; }, 6);
  tabs.push({ k:"regalos", n:"Regalos" });
  pans.push('<div class="mn-pan" role="tabpanel" id="mn-p-regalos" aria-labelledby="mn-t-regalos" hidden><h3>Regalos</h3>' +
    grande(col("regalos"), elegir(16, function(p){return (p.etiquetas||[]).indexOf("regalo")>-1;}), "Ver regalos") +
    '<div class="mn-grid">' + regalos.map(function(p){ return cuadro("producto.html?id=" + p.id, p.id, p.nombre); }).join("") + '</div></div>');
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

  /* ---------- SOPORTE ---------- */
  var ACC = [
    { k:"envios", n:"Envíos y entregas", t:'<p>Envío gratis en compras desde $950 a todo México.</p><p>Cada pieza va en su estuche con kit de limpieza y te mandamos la guía para que sigas tu paquete.</p>' },
    { k:"cambios", n:"Cambios y devoluciones", s:"30 días", t:'<p>Tienes 30 días desde que recibes tu pieza para cambiarla o devolverla.</p><p>Debe venir sin uso, con su estuche. Escríbenos con tu número de pedido y te decimos cómo mandarla.</p>' },
    { k:"garantia", n:"Garantía", s:"60 días", t:'<p>Todas las piezas tienen garantía de 60 días contra defectos de fabricación (broches, eslabones, soldaduras).</p><p>Cada pieza lleva el sello .925 que confirma que es plata ley .925.</p>' },
    { k:"cuidado", n:"Cuidado de la plata", t:'<ul><li>Quítatela para bañarte, nadar o hacer ejercicio.</li><li>Evita perfume, cremas y cloro directo.</li><li>Guárdala en su estuche, separada de otras piezas.</li><li>Si se opaca, límpiala con el kit de limpieza que viene con tu pieza.</li></ul>' },
    { k:"largos", n:"Guía de largos", t:'<p>Cómo queda cada largo de cadena:</p><ul><li><b>45–50 cm:</b> al cuello.</li><li><b>55 cm:</b> a la altura de la clavícula.</li><li><b>60 cm:</b> unos tres dedos abajo de la clavícula.</li><li><b>70 cm:</b> a la altura del esternón.</li></ul>' }
  ];
  var soporteHTML =
    '<div class="mn-capa mn-der" id="mn-soporte" aria-hidden="true">' +
      '<div class="mn-velo" data-mn-cerrar></div>' +
      '<div class="mn-panel" role="dialog" aria-modal="true" aria-labelledby="mn-sop-titulo">' +
        '<div class="mn-top"><h2 id="mn-sop-titulo">Soporte</h2><button class="mn-x" type="button" data-mn-cerrar aria-label="Cerrar soporte">' + X + '</button></div>' +
        '<div class="mn-sop-cuerpo">' +
          '<p class="mn-sop-intro">¿En qué te ayudamos? Elige un tema o escríbenos abajo.</p>' +
          ACC.map(function(a){
            return '<div class="mn-acc"><button class="mn-acc-b" type="button" aria-expanded="false" aria-controls="mn-a-' + a.k + '" data-mn-acc="' + a.k + '"><span>' + esc(a.n) + (a.s ? ' <small>(' + a.s + ')</small>' : '') + '</span>' + FLECHA + '</button>' +
              '<div class="mn-acc-t" id="mn-a-' + a.k + '" hidden>' + a.t + '</div></div>';
          }).join("") +
          '<div class="mn-acc"><a class="mn-acc-b" href="index.html#faq" data-mn-ir><span>Preguntas frecuentes</span>' + FLECHA + '</a></div>' +
          '<div class="mn-acc"><a class="mn-acc-b" href="index.html#mayoreo" data-mn-ir><span>Mayoreo</span>' + FLECHA + '</a></div>' +
          '<div class="mn-chat" id="mn-chat"><!-- chatbot aquí --></div>' +
          '<form class="mn-form" id="mn-form" novalidate>' +
            '<h3>Escríbenos</h3><p>Te contestamos por correo.</p>' +
            '<label for="mn-f-nombre">Nombre</label><input id="mn-f-nombre" name="nombre" type="text" autocomplete="name" required>' +
            '<label for="mn-f-correo">Correo</label><input id="mn-f-correo" name="correo" type="email" autocomplete="email" inputmode="email" required>' +
            '<label for="mn-f-msj">Mensaje</label><textarea id="mn-f-msj" name="mensaje" required></textarea>' +
            '<button class="mn-enviar" type="submit">Enviar mensaje</button>' +
            '<p class="mn-gracias" id="mn-gracias" role="status" hidden></p>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ---------- montaje y comportamiento ---------- */
  function montar(){
    var root = document.getElementById("menu-root");
    if (!root){ root = document.createElement("div"); root.id = "menu-root"; document.body.appendChild(root); }
    root.classList.add("mn-root");
    root.innerHTML = menuHTML + soporteHTML;

    var capas = { menu: document.getElementById("mn-menu"), soporte: document.getElementById("mn-soporte") };
    var botones = { menu: document.getElementById("btn-menu"), soporte: document.getElementById("btn-soporte") };
    var abierta = null, origen = null;

    Object.keys(botones).forEach(function(k){
      var b = botones[k]; if (!b) return;
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", "mn-" + k);
      b.setAttribute("aria-haspopup", "dialog");
      b.addEventListener("click", function(e){ e.preventDefault(); abrir(k, null, b); });
    });

    /* cualquier botón con data-soporte (pestaña "Soporte", "Pedir la lista"...) abre el mismo panel */
    document.addEventListener("click", function(e){
      var t = e.target.closest ? e.target.closest("[data-soporte]") : null;
      if (!t || t.closest("#menu-root")) return;
      e.preventDefault(); abrir("soporte", null, t);
    });

    function focables(el){
      return Array.prototype.filter.call(el.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex="0"]'), function(n){ return n.offsetParent !== null; });
    }
    function abrir(k, extra, quien){
      if (abierta && abierta !== k) cerrar(true);
      var capa = capas[k];
      origen = quien || document.activeElement;
      abierta = k;
      capa.classList.add("mn-on"); capa.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("mn-lock");
      if (botones[k]) botones[k].setAttribute("aria-expanded", "true");
      if (k === "menu") elegirTab(extra || tabActual || COLS[0].k, false);
      if (k === "soporte" && extra) abrirAcc(extra, true);
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

    // acordeón de soporte
    function abrirAcc(k, forzar){
      var b = capas.soporte.querySelector('[data-mn-acc="' + k + '"]'); if (!b) return;
      var abre = forzar || b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", abre ? "true" : "false");
      document.getElementById(b.getAttribute("aria-controls")).hidden = !abre;
      if (forzar) b.scrollIntoView({ block: "nearest" });
    }
    capas.soporte.addEventListener("click", function(e){
      var b = e.target.closest("[data-mn-acc]"); if (b) abrirAcc(b.getAttribute("data-mn-acc"), false);
    });

    // formulario: no envía, solo agradece
    var form = document.getElementById("mn-form");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var g = document.getElementById("mn-gracias");
      var campos = [form.nombre, form.correo, form.mensaje];
      for (var i = 0; i < campos.length; i++){
        if (!campos[i].value.trim() || !campos[i].checkValidity()){
          g.hidden = false; g.textContent = i === 1 && campos[i].value.trim() ? "Revisa tu correo, parece incompleto." : "Llena tu nombre, correo y mensaje.";
          campos[i].focus(); return;
        }
      }
      var nombre = form.nombre.value.trim().split(" ")[0];
      form.reset();
      g.hidden = false; g.textContent = "¡Gracias, " + nombre + "! Recibimos tu mensaje y te contestamos por correo.";
    });

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
      abrirSoporte: function(seccion){ abrir("soporte", seccion, botones.soporte); },
      cerrar: function(){ cerrar(); }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
})();
