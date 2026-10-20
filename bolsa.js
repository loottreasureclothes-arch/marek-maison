/* bolsa.js — bolsa de compras de Montaris (sin precios por ahora).
   API global:
     Bolsa.agregar(id, largo)   -> agrega 1 (si ya está la misma pieza y largo, suma cantidad). Devuelve el índice.
     Bolsa.quitar(indice)       -> quita esa línea.
     Bolsa.cantidad(indice, n)  -> cambia la cantidad (n<=0 la quita).
     Bolsa.vaciar()
     Bolsa.items()              -> [{id, largo, nombre, foto, cantidad, codigo}]
     Bolsa.contar()             -> total de piezas
     Bolsa.abrir() / Bolsa.cerrar()  -> panel deslizable
   Guarda en localStorage "montaris_bolsa". En cada cambio actualiza #n y dispara
   el evento "bolsa:cambio" (en document, burbujea a window) con detail {items, total}.
   El panel se engancha al clic en #btn-bolsa (o, si no existe, al botón/enlace que contiene #n). */
(function(){
  var KEY = 'montaris_bolsa';
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

  function agregar(id, largo){
    var arr = leer(), p = pieza(id);
    largo = largo || (p && p.largo) || null;
    for (var i = 0; i < arr.length; i++){
      if (String(arr[i].id) === String(id) && (arr[i].largo || null) === largo){
        arr[i].cantidad = (arr[i].cantidad || 1) + 1; guardar(arr); return i;
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

  /* ---------- panel ---------- */
  var css = '' +
  '.bz{position:fixed;inset:0;z-index:90;visibility:hidden;transition:visibility 0s .4s}' +
  '.bz.on{visibility:visible;transition:none}' +
  '.bz-v{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .4s ease}' +
  '.bz.on .bz-v{opacity:.35}' +
  '.bz-p{position:absolute;top:0;right:0;bottom:0;width:min(100vw,440px);background:#fff;color:#111;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .4s cubic-bezier(.23,1,.32,1);font-family:var(--f-txt,"Manrope",system-ui,sans-serif);padding-top:env(safe-area-inset-top,0px)}' +
  '.bz.on .bz-p{transform:none}' +
  '.bz-h{flex:none;display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 10px 0 20px;border-bottom:1px solid #eee}' +
  '.bz-h b{font:700 16px var(--f-txt,sans-serif)}' +
  '.bz-x{width:44px;height:44px;border:0;background:none;cursor:pointer;display:grid;place-items:center}' +
  '.bz-x svg{width:20px;height:20px;stroke:#111;stroke-width:1.8;fill:none}' +
  '.bz-env{flex:none;padding:12px 20px;background:#f6f6f4;font:500 12.5px/1.4 var(--f-txt,sans-serif);color:#444;border-bottom:1px solid #eee}' +
  '.bz-env b{color:#111}' +
  '.bz-l{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0 20px;margin:0;list-style:none}' +
  '.bz-i{display:grid;grid-template-columns:76px 1fr auto;gap:14px;padding:16px 0;border-bottom:1px solid #eee;align-items:start}' +
  '.bz-i img{width:76px;height:76px;object-fit:cover;background:#f2f2f2;border-radius:2px}' +
  '.bz-i a{font:600 14px/1.3 var(--f-txt,sans-serif);color:#111;text-decoration:none}' +
  '.bz-i small{display:block;margin-top:3px;font:500 12px var(--f-txt,sans-serif);color:#777}' +
  '.bz-i .pc{display:block;margin-top:6px;font:600 12.5px var(--f-txt,sans-serif);color:#555}' +
  '.bz-q{display:inline-flex;align-items:center;margin-top:10px;border:1px solid #ddd;border-radius:999px;height:34px}' +
  '.bz-q button{width:34px;height:32px;border:0;background:none;cursor:pointer;font:500 17px/1 var(--f-txt,sans-serif);color:#111}' +
  '.bz-q span{min-width:22px;text-align:center;font:600 13px var(--f-txt,sans-serif)}' +
  '.bz-del{width:36px;height:36px;border:0;background:none;cursor:pointer;display:grid;place-items:center;color:#777}' +
  '.bz-del svg{width:18px;height:18px;stroke:currentColor;stroke-width:1.7;fill:none}' +
  '.bz-vacio{padding:48px 0;text-align:center;color:#555;font:500 14px/1.5 var(--f-txt,sans-serif)}' +
  '.bz-vacio a{display:inline-flex;align-items:center;justify-content:center;margin-top:16px;height:46px;padding:0 24px;border:1px solid #111;border-radius:4px;color:#111;font:700 13px var(--f-txt,sans-serif);letter-spacing:.1em;text-transform:uppercase;text-decoration:none}' +
  '.bz-f{flex:none;padding:16px 20px calc(16px + env(safe-area-inset-bottom,0px));border-top:1px solid #eee;background:#fff}' +
  '.bz-t{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;font:700 15px var(--f-txt,sans-serif)}' +
  '.bz-t span{font:600 13px var(--f-txt,sans-serif);color:#555}' +
  '.bz-go{display:flex;align-items:center;justify-content:center;width:100%;height:52px;border:0;border-radius:4px;background:#111;color:#fff;font:700 14px var(--f-txt,sans-serif);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;cursor:pointer}' +
  '.bz-seg{display:block;width:100%;margin-top:8px;height:44px;border:0;background:none;font:600 13px var(--f-txt,sans-serif);color:#555;text-decoration:underline;cursor:pointer}' +
  '.bz-ok{flex:none;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:12px;font:500 11.5px var(--f-txt,sans-serif);color:#666}' +
  '.bz-ok span::before{content:"✓ ";color:#111}' +
  'html.bz-lock{overflow:hidden}' +
  '@media (prefers-reduced-motion:reduce){.bz-p,.bz-v{transition:none}}';

  var raiz = null, lista, pie, titulo, ultimoFoco = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function montar(){
    if (raiz || !document.body) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    raiz = document.createElement('div');
    raiz.className = 'bz'; raiz.id = 'bolsa-panel';
    raiz.setAttribute('aria-hidden', 'true');
    raiz.innerHTML =
      '<div class="bz-v" data-bz-cerrar></div>' +
      '<aside class="bz-p" role="dialog" aria-modal="true" aria-labelledby="bz-tt">' +
        '<div class="bz-h"><b id="bz-tt">Tu bolsa</b><button class="bz-x" type="button" data-bz-cerrar aria-label="Cerrar bolsa"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
        '<div class="bz-env"><b>Envío gratis desde $950</b> · 30 días para cambios · garantía 60 días</div>' +
        '<ul class="bz-l"></ul>' +
        '<div class="bz-f"></div>' +
      '</aside>';
    document.body.appendChild(raiz);
    lista = raiz.querySelector('.bz-l'); pie = raiz.querySelector('.bz-f'); titulo = raiz.querySelector('#bz-tt');

    raiz.addEventListener('click', function(e){
      var t = e.target;
      if (t.closest('[data-bz-cerrar]')) { cerrar(); return; }
      var del = t.closest('[data-bz-del]'); if (del) { quitar(+del.getAttribute('data-bz-del')); return; }
      var q = t.closest('[data-bz-q]');
      if (q) { var i = +q.getAttribute('data-bz-q'), it = leer()[i]; if (it) cantidad(i, (it.cantidad || 1) + (+q.getAttribute('data-d'))); }
    });
    document.addEventListener('keydown', function(e){
      if (!raiz.classList.contains('on')) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab') {
        var f = raiz.querySelectorAll('button,a[href]'); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    pintar();
  }

  function pintar(){
    if (!raiz) return;
    var its = items(), n = contar();
    titulo.textContent = n ? 'Tu bolsa · ' + n : 'Tu bolsa';
    if (!its.length){
      lista.innerHTML = '<li class="bz-vacio">Tu bolsa está vacía.<br><a href="coleccion.html?c=cadenas">Ver cadenas</a></li>';
      pie.innerHTML = '<button class="bz-seg" type="button" data-bz-cerrar>Seguir viendo</button>';
      return;
    }
    lista.innerHTML = its.map(function(it, i){
      return '<li class="bz-i">' +
        '<a href="producto.html?id=' + encodeURIComponent(it.id) + '"><img src="' + esc(it.foto) + '" alt="" width="76" height="76" loading="lazy"></a>' +
        '<div><a href="producto.html?id=' + encodeURIComponent(it.id) + '">' + esc(it.nombre) + '</a>' +
          '<small>' + (it.largo ? 'Largo ' + esc(it.largo) + ' · ' : '') + 'Plata .925' + (it.codigo ? ' · ' + esc(it.codigo) : '') + '</small>' +
          '<span class="pc">Precio por confirmar</span>' +
          '<div class="bz-q" role="group" aria-label="Cantidad"><button type="button" data-bz-q="' + i + '" data-d="-1" aria-label="Quitar una">−</button><span>' + it.cantidad + '</span><button type="button" data-bz-q="' + i + '" data-d="1" aria-label="Agregar una">+</button></div>' +
        '</div>' +
        '<button class="bz-del" type="button" data-bz-del="' + i + '" aria-label="Quitar ' + esc(it.nombre) + '"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' +
      '</li>';
    }).join('');
    pie.innerHTML =
      '<div class="bz-t">Total <span>Precio por confirmar</span></div>' +
      '<a class="bz-go" href="pago.html">Comprar ahora</a>' +
      '<div class="bz-ok"><span>Hasta 6 meses sin intereses</span><span>Sello .925</span><span>Kit de limpieza</span></div>' +
      '<button class="bz-seg" type="button" data-bz-cerrar>Seguir viendo</button>';
  }

  function abrir(){
    montar(); if (!raiz) return;
    ultimoFoco = document.activeElement;
    pintar();
    raiz.classList.add('on'); raiz.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('bz-lock');
    var x = raiz.querySelector('.bz-x'); if (x) setTimeout(function(){ x.focus(); }, 50);
  }
  function cerrar(){
    if (!raiz || !raiz.classList.contains('on')) return;
    raiz.classList.remove('on'); raiz.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('bz-lock');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
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

  window.Bolsa = { agregar: agregar, quitar: quitar, cantidad: cantidad, vaciar: vaciar, items: items, contar: contar, abrir: abrir, cerrar: cerrar };

  function iniciar(){ montar(); avisar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
