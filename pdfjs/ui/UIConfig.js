// =========================================================
// JEANSELLEM — UIConfig (UI + barre flottante interne) v23
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // Badge debug 3 s (peut être retiré)
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v23 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b);
    setTimeout(()=> b.remove(), 3000);
  }

  // Verrous
  UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);
  UI.setFeatureFlags?.({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true
  });

  // ► Cacher boutons "inutiles" en haut + le pager “6/19”
  const HIDE_TOP = [
    // haut-droite
    'searchButton',
    'toggleNotesButton','notesPanelButton',
    'settingsButton','menuButton','ribbonsDropdownButton',
    // notre ancien FS d’en-tête (on garde celui de la barre flottante)
    'myFullscreenButton',
    // petit overlay de pagination “6/19”
    'pageNavOverlay','pageNavigationOverlay'
  ];
  try {
    UI.disableElements(HIDE_TOP);
    HIDE_TOP.forEach(id => UI.updateElement?.(id, { hidden:true, disabled:true }));
    // ferme d’éventuels popups
    UI.closeElements?.(['pageNavOverlay','pageNavigationOverlay']);
  } catch(e){}

  // Réordonner les contrôles zoom du header (on les garde)
  UI.setHeaderItems(header => {
    // on force juste l’ordre zoom-, %, zoom+ ; rien d’autre n’est ajouté
    header.push({ type:'zoomOutButton' },{ type:'zoomDropdown' },{ type:'zoomInButton' });
  });

  // Mobile : couverture + page-by-page + FitWidth
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
    try { UI.setScrollMode?.(UI.ScrollMode.PAGE); } catch(e){}
    try { UI.setPageTransitionMode?.(UI.PageTransitionMode.PAGE); } catch(e){}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e){}
    try { Core.documentViewer.setCurrentPage(1); } catch(e){}
  });

  UI.setTheme('light');

  // ===== Barre flottante (bas-centre) =====
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
      const max  = dv.getPageCount?.() || 1;

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
  }
  mountToolbar();
  new MutationObserver(mountToolbar).observe(document.body, { childList:true, subtree:true });
});
