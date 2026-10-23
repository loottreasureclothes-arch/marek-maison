/* bolsa.js — carrito de compras de Montaris (API sigue llamándose Bolsa) (sin precios por ahora).
   El panel copia el carrito de boxroomshop.com (UpCart): entra por la derecha, pantalla completa en celular
   y 420 px en escritorio; encabezado "Carrito • n" con X; aviso de envío gratis con barra; filas con foto,
   nombre, largo, precio, cantidad − n + y bote para quitar; "También te puede gustar" con Agregar;
   pie gris con subtotal, botón negro y formas de pago.
   API global:
     Bolsa.agregar(id, largo)   -> agrega 1 (si ya está la misma pieza y largo, suma cantidad). Devuelve el índice.
     Bolsa.quitar(indice)       -> quita esa línea.
     Bolsa.cantidad(indice, n)  -> cambia la cantidad (n<=0 la quita).
     Bolsa.vaciar()
     Bolsa.items()              -> [{id, largo, nombre, foto, cantidad, codigo}]
     Bolsa.contar()             -> total de piezas
     Bolsa.abrir() / Bolsa.cerrar()  -> panel deslizable
     Bolsa.rapido(id)           -> hoja rápida: foto, largo y "Agregar al carrito" / "Comprar ahora"
   Guarda en localStorage "montaris_bolsa". En cada cambio actualiza #n y dispara
   el evento "bolsa:cambio" (en document, burbujea a window) con detail {items, total}.
   El panel se engancha al clic en #btn-bolsa (o, si no existe, al botón/enlace que contiene #n). */
(function(){
  var KEY = 'montaris_bolsa';
  var ENVIO = 950;
  var mem = [];

  function leer(){
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch(e){ return mem.slice(); }
  }
  function guardar(arr){
    mem = arr;
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e){}
    avisar();
  }
  function pieza(id){
    if (typeof CAT === 'undefined') return null;
    for (var i = 0; i < CAT.length; i++) if (String(CAT[i].id) === String(id)) return CAT[i];
    return null;
  }
  function items(){
    return leer().map(function(r){
      var p = pieza(r.id);
      return {
        id: r.id,
        largo: r.largo || (p && p.largo) || null,
        nombre: p ? p.nombre : 'Pieza ' + r.id,
        codigo: p ? p.codigo : '',
        foto: p ? 'img/prod/' + p.carpeta + '/c.jpg' : '',
        cantidad: r.cantidad || 1
      };
    });
  }
  function contar(){ return leer().reduce(function(s, r){ return s + (r.cantidad || 1); }, 0); }
  /* subtotal solo si todas las piezas ya tienen precio en el catálogo; si no, null */
  function subtotal(){
    var arr = leer(), s = 0;
    for (var i = 0; i < arr.length; i++){ var p = pieza(arr[i].id); if (!p || typeof p.precio !== 'number') return null; s += p.precio * (arr[i].cantidad || 1); }
    return arr.length ? s : null;
  }
  function pesos(n){ return '$ ' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function agregar(id, largo){
    var arr = leer(), p = pieza(id);
    largo = largo || (p && p.largo) || null;
    for (var i = 0; i < arr.length; i++){
      if (String(arr[i].id) === String(id) && (arr[i].largo || null) === largo){
        arr[i].cantidad = Math.min((arr[i].cantidad || 1) + 1, 20); guardar(arr); return i;
      }
    }
    arr.push({ id: isNaN(+id) ? id : +id, largo: largo, cantidad: 1 });
    guardar(arr); return arr.length - 1;
  }
  function quitar(i){ var arr = leer(); if (i >= 0 && i < arr.length){ arr.splice(i, 1); guardar(arr); } }
  function cantidad(i, n){
    var arr = leer(); if (!(i >= 0 && i < arr.length)) return;
    if (n <= 0) { arr.splice(i, 1); } else { arr[i].cantidad = Math.min(n, 20); }
    guardar(arr);
  }
  function vaciar(){ guardar([]); }

  function avisar(){
    var n = contar();
    var b = document.getElementById('n');
    if (b){
      b.textContent = n;
      var cont = b.closest('.n') || b;
      cont.style.visibility = n ? '' : 'hidden';
    }
    pintar();
    try {
      document.dispatchEvent(new CustomEvent('bolsa:cambio', { bubbles: true, detail: { items: items(), total: n } }));
    } catch(e){}
  }

  /* ---------- panel (medidas del carrito de Boxroom) ---------- */
  var F = 'var(--f-txt,"Manrope",system-ui,sans-serif)';
  var css = '' +
  '.bz{position:fixed;inset:0;z-index:995;visibility:hidden;transition:visibility 0s .25s;font-family:' + F + '}' +
  '.bz.on{visibility:visible;transition:none}' +
  '.bz-v{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .25s ease}' +
  '.bz.on .bz-v{opacity:.5}' +
  '.bz-p{position:absolute;top:0;right:0;bottom:0;width:100%;max-width:420px;background:#fff;color:#000;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease;padding-top:env(safe-area-inset-top,0px);box-shadow:-4px 0 24px rgba(0,0,0,.12)}' +
  '.bz.on .bz-p{transform:none}' +
  '.bz-h{flex:none;display:flex;align-items:center;justify-content:space-between;min-height:51px;padding:10px 20px;border-bottom:1px solid rgba(0,0,0,.1)}' +
  '.bz-h h3{margin:0;font:700 16.4px/1.4 ' + F + ';color:#000}' +
  '.bz-x{width:36px;height:36px;margin-right:-6px;border:0;border-radius:14px;background:none;cursor:pointer;display:grid;place-items:center;color:#000}' +
  '.bz-x svg{width:15px;height:15px;stroke:currentColor;stroke-width:2;fill:none}' +
  '.bz-c{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}' +
  '.bz-env{padding:2px 20px 14px;text-align:center}' +
  '.bz-env p{margin:0 0 10px;font:400 13px/1.7 ' + F + ';color:#000}' +
  '.bz-env p b{font-weight:700}' +
  '.bz-tr{display:flex;align-items:center;gap:10px}' +
  '.bz-bar{flex:1;height:8px;border-radius:4px;background:#ececec;overflow:hidden}' +
  '.bz-bar i{display:block;height:100%;width:0;border-radius:4px;background:#6dde7e;transition:width .3s ease}' +
  '.bz-mi{display:grid;justify-items:center;gap:2px;width:80px;flex:none;font:400 10px/1.2 ' + F + ';color:#000;text-align:center}' +
  '.bz-mi svg{width:20px;height:20px;stroke:#000;stroke-width:1.8;fill:none}' +
  '.bz-l{list-style:none;margin:0;padding:0}' +
  '.bz-i{position:relative;display:grid;grid-template-columns:88px 1fr;gap:16px;padding:18px;border-bottom:1px solid #eaeaea}' +
  '.bz-i>a img{width:88px;height:88px;object-fit:cover;background:#f3f3f1}' +
  '.bz-i .nm{display:block;padding-right:32px;font:600 13px/1.4 ' + F + ';color:#000;text-decoration:none}' +
  '.bz-i .lg{display:block;font:400 14px/1.65 ' + F + ';color:#999}' +
  '.bz-i .pc{display:block;font:500 13px/1.7 ' + F + ';color:#000}' +
  '.bz-q{display:inline-flex;align-items:center;margin-top:6px;border:1px solid #ccc;border-radius:4px;overflow:hidden}' +
  '.bz-q button{width:29px;height:28px;padding:0;border:0;background:#fff;cursor:pointer;font:400 15px/1 Arial,sans-serif;color:#000}' +
  '.bz-q span{display:grid;place-items:center;width:40px;height:28px;border-inline:1px solid #ccc;font:400 14px Arial,sans-serif;color:#000}' +
  '.bz-del{position:absolute;top:14px;right:14px;width:32px;height:32px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:#555}' +
  '.bz-del svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.7;fill:none}' +
  '.bz-vacio{padding:56px 24px;text-align:center;font:400 15px/1.5 ' + F + ';color:#000}' +
  '.bz-vacio button{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;height:51px;padding:0 32px;border:0;border-radius:14px;background:#000;color:#fff;font:600 15px ' + F + ';cursor:pointer}' +
  '.bz-up{padding:26px 0 22px}' +
  '.bz-up h4{margin:0 0 14px;text-align:center;font:600 18px/1.7 ' + F + ';color:#000}' +
  '.bz-uw{position:relative;padding:0 28px}' +
  '.bz-us{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;gap:12px}' +
  '.bz-us::-webkit-scrollbar{display:none}' +
  '.bz-u{flex:0 0 100%;scroll-snap-align:start;display:grid;grid-template-columns:90px 1fr;gap:16px;align-items:center;padding:16px;border-radius:8px;background:#f6f6f7}' +
  '.bz-u img{width:90px;height:90px;object-fit:cover;background:#fff}' +
  '.bz-u a{font:600 12px/1.5 ' + F + ';color:#000;text-decoration:none}' +
  '.bz-u .pc{display:block;font:400 12px/1.6 ' + F + ';color:#000}' +
  '.bz-u .lg{display:block;font:400 12px/1.6 ' + F + ';color:#777}' +
  '.bz-u button{margin-top:8px;height:34px;padding:0 16px;border:0;border-radius:14px;background:#000;color:#fff;font:600 13px ' + F + ';cursor:pointer}' +
  '.bz-ar{position:absolute;top:50%;width:26px;height:40px;margin-top:-20px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:#000}' +
  '.bz-ar[disabled]{color:rgba(16,16,16,.3);cursor:default}' +
  '.bz-ar svg{width:14px;height:14px;stroke:currentColor;stroke-width:2.4;fill:none}' +
  '.bz-ar.l{left:2px}.bz-ar.r{right:2px}' +
  '.bz-f{flex:none;padding:20px 23px calc(18px + env(safe-area-inset-bottom,0px));border-top:1px solid rgba(0,0,0,.1);background:#f6f6f7}' +
  '.bz-t{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px;font:400 20px/1.7 ' + F + ';color:#000}' +
  '.bz-t span:last-child{font-size:17px}' +
  '.bz-go{display:flex;align-items:center;justify-content:center;width:100%;min-height:51px;padding:14px;border:0;border-radius:14px;background:#000;color:#fff;font:600 15px ' + F + ';text-decoration:none;cursor:pointer}' +
  '.bz-seg{display:block;width:100%;margin-top:6px;height:44px;border:0;background:none;font:600 13px ' + F + ';color:#000;text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
  '.bz-pay{display:flex;justify-content:center;gap:8px;margin-top:4px}' +
  '.bz-pay img{width:38px;height:24px;object-fit:contain;border:1px solid #e3e3e3;border-radius:4px;background:#fff}' +
  'html.bz-lock{overflow:hidden}' +
  '@media (prefers-reduced-motion:reduce){.bz-p,.bz-v,.bz-bar i{transition:none}}';

  var raiz = null, cuerpo, pie, titulo, ultimoFoco = null;
  var I = {
    x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>',
    bote: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg>',
    camion: '<svg viewBox="0 0 24 24"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></svg>',
    izq: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    der: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg>'
  };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function montar(){
    if (raiz || !document.body) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    raiz = document.createElement('div');
    raiz.className = 'bz'; raiz.id = 'bolsa-panel';
    raiz.setAttribute('aria-label', 'Carrito');
    raiz.setAttribute('aria-hidden', 'true');
    raiz.innerHTML =
      '<div class="bz-v" data-bz-cerrar></div>' +
      '<aside class="bz-p" role="dialog" aria-modal="true" aria-labelledby="bz-tt">' +
        '<div class="bz-h"><h3 id="bz-tt">Carrito</h3><button class="bz-x" type="button" data-bz-cerrar aria-label="Cerrar carrito">' + I.x + '</button></div>' +
        '<div class="bz-c"></div>' +
        '<div class="bz-f"></div>' +
      '</aside>';
    document.body.appendChild(raiz);
    cuerpo = raiz.querySelector('.bz-c'); pie = raiz.querySelector('.bz-f'); titulo = raiz.querySelector('#bz-tt');

    raiz.addEventListener('click', function(e){
      var t = e.target;
      if (t.closest('[data-bz-cerrar]')) { cerrar(); return; }
      var del = t.closest('[data-bz-del]'); if (del) { quitar(+del.getAttribute('data-bz-del')); return; }
      var q = t.closest('[data-bz-q]');
      if (q) { var i = +q.getAttribute('data-bz-q'), it = leer()[i]; if (it) cantidad(i, (it.cantidad || 1) + (+q.getAttribute('data-d'))); return; }
      var up = t.closest('[data-bz-up]');
      if (up) { var p = pieza(up.getAttribute('data-bz-up')); if (p) { agregar(p.id, p.largo); cuerpo.scrollTop = 0; } return; }
      var ar = t.closest('.bz-ar');
      if (ar) { var s = raiz.querySelector('.bz-us'); if (s) s.scrollBy({ left: (ar.classList.contains('l') ? -1 : 1) * s.clientWidth, behavior: 'smooth' }); }
    });
    raiz.addEventListener('scroll', function(e){ if (e.target.classList && e.target.classList.contains('bz-us')) flechas(); }, true);
    document.addEventListener('keydown', function(e){
      if (!raiz.classList.contains('on')) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab') {
        var f = [].filter.call(raiz.querySelectorAll('button:not([disabled]),a[href]'), function(x){ return x.offsetParent !== null; }); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    pintar();
  }

  function flechas(){
    var s = raiz && raiz.querySelector('.bz-us'); if (!s) return;
    var l = raiz.querySelector('.bz-ar.l'), r = raiz.querySelector('.bz-ar.r');
    if (l) l.disabled = s.scrollLeft < 4;
    if (r) r.disabled = s.scrollLeft + s.clientWidth >= s.scrollWidth - 4;
  }

  /* sugerencias: misma colección que lo que ya está en la bolsa, sin repetir piezas ni la misma cadena */
  function sugerencias(arr){
    if (typeof CAT === 'undefined' || !arr.length) return [];
    var en = {}, grupos = {}, cols = {};
    arr.forEach(function(r){ var p = pieza(r.id); en[r.id] = 1; if (p){ cols[p.coleccion] = 1; if (p.grupo) grupos[p.grupo] = 1; } });
    var out = [];
    CAT.forEach(function(p){
      if (out.length >= 6 || en[p.id] || !cols[p.coleccion]) return;
      var g = p.grupo || ('#' + p.id); if (grupos[g]) return; grupos[g] = 1; out.push(p);
    });
    return out;
  }

  function pintar(){
    if (!raiz) return;
    var arr = leer(), its = items(), n = contar();
    titulo.textContent = n ? 'Carrito • ' + n : 'Carrito';
    if (!its.length){
      cuerpo.innerHTML = '<div class="bz-vacio">Tu carrito está vacío.<br><button type="button" data-bz-cerrar>Seguir explorando</button></div>';
      pie.style.display = 'none';
      return;
    }
    pie.style.display = '';
    var sub = subtotal();
    var falta = sub == null ? null : Math.max(0, ENVIO - sub);
    var ancho = sub == null ? 0 : Math.min(100, sub / ENVIO * 100);
    var msj = falta == null ? '<b>Envío GRATIS</b> en pedidos desde $950.'
      : (falta > 0 ? 'Estás a <b>' + pesos(falta) + '</b> de tu envío GRATIS.' : '¡Ya tienes <b>envío GRATIS</b>!');
    var sug = sugerencias(arr);
    cuerpo.innerHTML =
      '<div class="bz-env"><p>' + msj + '</p><div class="bz-tr"><div class="bz-bar"><i style="width:' + ancho + '%"></i></div><div class="bz-mi">' + I.camion + '<span>Envío gratis<br>desde $950</span></div></div></div>' +
      '<ul class="bz-l">' + its.map(function(it, i){
        var url = 'producto.html?id=' + encodeURIComponent(it.id);
        return '<li class="bz-i">' +
          '<a href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + esc(it.foto) + '" alt="" width="88" height="88" loading="lazy"></a>' +
          '<div><a class="nm" href="' + url + '">' + esc(it.nombre) + '</a>' +
            (it.largo ? '<span class="lg">Largo: ' + esc(it.largo) + '</span>' : '<span class="lg">Plata .925</span>') +
            '<span class="pc">Precio por confirmar</span>' +
            '<div class="bz-q" role="group" aria-label="Cantidad"><button type="button" data-bz-q="' + i + '" data-d="-1" aria-label="Quitar una">−</button><span aria-live="polite">' + it.cantidad + '</span><button type="button" data-bz-q="' + i + '" data-d="1" aria-label="Agregar una">+</button></div>' +
          '</div>' +
          '<button class="bz-del" type="button" data-bz-del="' + i + '" aria-label="Quitar ' + esc(it.nombre) + '">' + I.bote + '</button>' +
        '</li>';
      }).join('') + '</ul>' +
      (sug.length ? '<div class="bz-up"><h4>También te puede gustar</h4><div class="bz-uw">' +
        '<button class="bz-ar l" type="button" aria-label="Anterior" disabled>' + I.izq + '</button>' +
        '<div class="bz-us">' + sug.map(function(p){
          var url = 'producto.html?id=' + p.id;
          return '<div class="bz-u"><a href="' + url + '" tabindex="-1" aria-hidden="true"><img src="img/prod/' + esc(p.carpeta) + '/c.jpg" alt="" width="90" height="90" loading="lazy"></a>' +
            '<div><a href="' + url + '">' + esc(p.nombre) + '</a><span class="pc">Precio por confirmar</span>' + (p.largo ? '<span class="lg">Largo: ' + esc(p.largo) + '</span>' : '') +
            '<button type="button" data-bz-up="' + p.id + '">Agregar</button></div></div>';
        }).join('') + '</div>' +
        '<button class="bz-ar r" type="button" aria-label="Siguiente">' + I.der + '</button>' +
      '</div></div>' : '');
    pie.innerHTML =
      '<div class="bz-t"><span>Subtotal</span><span>' + (sub == null ? 'Por confirmar' : pesos(sub)) + '</span></div>' +
      '<a class="bz-go" href="pago.html">Comprar ahora</a>' +
      '<button class="bz-seg" type="button" data-bz-cerrar>Seguir explorando</button>' +
      '<div class="bz-pay" aria-label="Formas de pago"><img src="pay/visa.svg" alt="Visa"><img src="pay/master.svg" alt="Mastercard"><img src="pay/american_express.svg" alt="American Express"></div>';
    flechas();
  }

  function abrir(){
    montar(); if (!raiz) return;
    ultimoFoco = document.activeElement;
    pintar();
    raiz.classList.add('on'); raiz.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('bz-lock');
    var x = raiz.querySelector('.bz-x'); if (x) setTimeout(function(){ x.focus(); flechas(); }, 60);
  }
  function cerrar(){
    if (!raiz || !raiz.classList.contains('on')) return;
    raiz.classList.remove('on'); raiz.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('bz-lock');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  /* ---------- hoja rápida (Bolsa.rapido): abajo en celular, modal chico en escritorio ---------- */
  var cssR = '' +
  '.rq{position:fixed;inset:0;z-index:994;visibility:hidden;transition:visibility 0s .25s;font-family:' + F + '}' +
  '.rq.on{visibility:visible;transition:none}' +
  '.rq-v{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .25s ease}' +
  '.rq.on .rq-v{opacity:.5}' +
  '.rq-p{position:absolute;left:0;right:0;bottom:0;background:#fff;color:#000;border-radius:16px 16px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));transform:translateY(100%);transition:transform .28s ease;box-shadow:0 -6px 24px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto}' +
  '.rq.on .rq-p{transform:none}' +
  '.rq-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:#000}' +
  '.rq-x svg{width:15px;height:15px;stroke:currentColor;stroke-width:2;fill:none}' +
  '.rq-t{display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center;padding-right:30px}' +
  '.rq-t img{width:96px;height:96px;object-fit:cover;border-radius:8px;background:#f3f3f1}' +
  '.rq-t b{display:block;font:700 15px/1.35 ' + F + '}' +
  '.rq-t span{display:block;margin-top:4px;font:400 13px/1.4 ' + F + ';color:#666}' +
  '.rq-lb{margin:16px 0 8px;font:700 12px ' + F + ';letter-spacing:.08em;text-transform:uppercase}' +
  '.rq-lg{display:flex;flex-wrap:wrap;gap:8px}' +
  '.rq-lg button{min-width:72px;height:42px;padding:0 14px;border:1px solid #ccc;border-radius:999px;background:#fff;color:#111;font:600 13.5px ' + F + ';cursor:pointer}' +
  '.rq-lg button[aria-pressed=true]{border-color:#111;background:#111;color:#fff}' +
  '.rq-bt{display:grid;gap:10px;margin-top:18px}' +
  '.rq-bt button{height:52px;border:2px solid #282828;border-radius:0;font:600 13px ' + F + ';letter-spacing:.14em;text-transform:uppercase;cursor:pointer}' +
  '.rq-ag{background:#282828;color:#fff}' +
  '.rq-ya{background:#eefbf0;border-color:#32d74b;color:#0b2e13}' +
  'html.rq-lock{overflow:hidden}' +
  '@media (min-width:768px){.rq-p{left:50%;right:auto;bottom:auto;top:50%;width:420px;border-radius:16px;transform:translate(-50%,-40%);opacity:0;transition:transform .25s ease,opacity .25s ease}.rq.on .rq-p{transform:translate(-50%,-50%);opacity:1}}' +
  '@media (prefers-reduced-motion:reduce){.rq-p,.rq-v{transition:none}}';
  var rq = null, rqSel = null, rqFoco = null;
  function variantes(p){
    if (!p.grupo || typeof CAT === 'undefined') return [p];
    return CAT.filter(function(x){ return x.grupo === p.grupo; });
  }
  function rqPintar(){
    var p = pieza(rqSel); if (!p) return;
    var vs = variantes(p);
    rq.querySelector('.rq-c').innerHTML =
      '<div class="rq-t"><img src="img/prod/' + esc(p.carpeta) + '/c.jpg" alt="" width="96" height="96"><div><b id="rq-tt">' + esc(p.grupo || p.nombre) + '</b><span>Plata .925 con sello' + (p.peso ? ' · ' + esc(p.peso) : '') + '</span><span>Precio por confirmar</span></div></div>' +
      (vs.length > 1 ? '<p class="rq-lb">Largo</p><div class="rq-lg" role="group" aria-label="Largo">' + vs.map(function(v){
        return '<button type="button" data-rq-v="' + v.id + '" aria-pressed="' + (String(v.id) === String(p.id)) + '">' + esc(v.largo || v.nombre) + '</button>'; }).join('') + '</div>'
        : (p.largo ? '<p class="rq-lb">Largo: ' + esc(p.largo) + '</p>' : ''));
  }
  function rqMontar(){
    if (rq || !document.body) return;
    var st = document.createElement('style'); st.textContent = cssR; document.head.appendChild(st);
    rq = document.createElement('div'); rq.className = 'rq'; rq.setAttribute('aria-hidden', 'true');
    rq.innerHTML = '<div class="rq-v" data-rq-cerrar></div><div class="rq-p" role="dialog" aria-modal="true" aria-labelledby="rq-tt">' +
      '<button class="rq-x" type="button" data-rq-cerrar aria-label="Cerrar">' + I.x + '</button><div class="rq-c"></div>' +
      '<div class="rq-bt"><button class="rq-ag" type="button" data-rq="ag">Agregar al carrito</button><button class="rq-ya" type="button" data-rq="ya">Comprar ahora</button></div></div>';
    document.body.appendChild(rq);
    rq.addEventListener('click', function(e){
      var t = e.target;
      if (t.closest('[data-rq-cerrar]')) { rqCerrar(); return; }
      var v = t.closest('[data-rq-v]'); if (v) { rqSel = v.getAttribute('data-rq-v'); rqPintar(); return; }
      var b = t.closest('[data-rq]'); if (!b) return;
      var p = pieza(rqSel); if (!p) return;
      agregar(p.id, p.largo);
      rqCerrar(true);
      if (b.getAttribute('data-rq') === 'ya') location.href = 'pago.html'; else abrir();
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && rq.classList.contains('on')) rqCerrar(); });
  }
  function rapido(id){
    rqMontar(); if (!rq || !pieza(id)) return;
    rqSel = id; rqFoco = document.activeElement; rqPintar();
    rq.classList.add('on'); rq.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('rq-lock');
    setTimeout(function(){ var a = rq.querySelector('.rq-ag'); if (a) a.focus(); }, 60);
  }
  function rqCerrar(sinFoco){
    if (!rq || !rq.classList.contains('on')) return;
    rq.classList.remove('on'); rq.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('rq-lock');
    if (!sinFoco && rqFoco && rqFoco.focus) rqFoco.focus();
  }

  /* clic en el ícono de bolsa: #btn-bolsa o el botón/enlace que contiene #n */
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target : e.target.parentElement;
    if (!t) return;
    var hit = t.closest('#btn-bolsa');
    if (!hit && !document.getElementById('btn-bolsa')) {
      var n = document.getElementById('n');
      var cont = n && (n.closest('button,a') || n);
      if (cont && cont.contains(t)) hit = cont;
    }
    if (hit) { e.preventDefault(); e.stopPropagation(); abrir(); }
  }, true);

  /* otra pestaña cambió la bolsa */
  window.addEventListener('storage', function(e){ if (e.key === KEY) avisar(); });

  window.Bolsa = { agregar: agregar, quitar: quitar, cantidad: cantidad, vaciar: vaciar, items: items, contar: contar, abrir: abrir, cerrar: cerrar, rapido: rapido };

  function iniciar(){ montar(); avisar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
