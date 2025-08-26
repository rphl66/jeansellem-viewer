// =========================================================
// JEANSELLEM — UIConfig (v26)
// Barre du haut VIDÉE + barre flottante interne (toujours visible)
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const inst = window.instance;
  if (!inst || !inst.UI) return;
  const { UI, Core } = inst;

  // --- petit badge debug 3s
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v26 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b); setTimeout(()=>b.remove(), 3000);
  }

  // --- verrouillages classiques
  UI.setToolbarGroup?.(UI.ToolbarGroup.View);
  UI.setFeatureFlags?.({ disableLocalFilePicker:true, disablePrint:true, disableDownload:true });

  // --- vider complètement la barre du haut
  UI.setHeaderItems(() => {});             // <— rien dans le header
  UI.disableElements?.(['toolsHeader','toolsOverlay']); // coupe toute barre d’annotation résiduelle

  // --- cacher le mini pager “x/xx”
  ['pageNavOverlay','pageNavigationOverlay'].forEach(id=>{
    try { UI.updateElement?.(id, { hidden:true, disabled:true }); } catch(_){}
  });
  UI.closeElements?.(['pageNavOverlay','pageNavigationOverlay']);

  // --- barre flottante
  function mountToolbar(){
    if (document.getElementById('jsl-toolbar')) return;

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    bar.className = 'jsl-toolbar';
    bar.innerHTML = `
      <button class="jsl-btn" data-act="zout" title="Zoom out" aria-label="Zoom out">−</button>
      <button class="jsl-btn" data-act="zin"  title="Zoom in"  aria-label="Zoom in">+</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn" data-act="first" title="Première page" aria-label="Première page">⏮︎</button>
      <button class="jsl-btn" data-act="prev"  title="Page précédente" aria-label="Page précédente">◀︎</button>
      <button class="jsl-btn" data-act="next"  title="Page suivante"  aria-label="Page suivante">▶︎</button>
      <button class="jsl-btn" data-act="last"  title="Dernière page"  aria-label="Dernière page">⏭︎</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn jsl-btn-fs" data-act="fs" title="Plein écran" aria-label="Plein écran">⤢</button>
    `;
    (document.getElementById('app') || document.body).appendChild(bar);

    const dv = Core.documentViewer;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn'); if (!btn) return;
      const act = btn.dataset.act;
      const page = dv.getCurrentPage?.() || 1;
      const max  = dv.getPageCount?.()  || 1;
      switch (act) {
        case 'zin':  UI.zoomIn?.(); break;
        case 'zout': UI.zoomOut?.(); break;
        case 'first': dv.setCurrentPage?.(1); break;
        case 'prev':  dv.setCurrentPage?.(Math.max(1, page - 1)); break;
        case 'next':  dv.setCurrentPage?.(Math.min(max, page + 1)); break;
        case 'last':  dv.setCurrentPage?.(max); break;
        case 'fs':    UI.enterFullscreen?.(); break;
      }
    });

    // log pour vérifier dans la console de l’iframe
    console.log('✅ jsl-toolbar monté');
  }

  // Monter la barre après chargement + sur recompositions
  requestAnimationFrame(mountToolbar);
  Core.documentViewer.addEventListener('documentLoaded', () => setTimeout(mountToolbar, 0));
  new MutationObserver(mountToolbar).observe(document.body, { childList:true, subtree:true });
});
