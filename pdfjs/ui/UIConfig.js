// =========================================================
// JEANSELLEM — UIConfig (v25) : header vide + barre flottante
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const inst = window.instance;
  if (!inst || !inst.UI) return;
  const { UI, Core } = inst;

  // --- Badge debug (3 s)
  (function badge(){
    const id = 'jsl-debug';
    if (document.getElementById(id)) return;
    const b = document.createElement('div');
    b.id = id;
    b.textContent = 'JSL UI v25 OK';
    Object.assign(b.style,{
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'.85'
    });
    document.body.appendChild(b);
    setTimeout(()=>b.remove(),3000);
  })();

  // --- Verrous de base
  try {
    UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);
    UI.setFeatureFlags && UI.setFeatureFlags({
      disableLocalFilePicker:true,
      disablePrint:true,
      disableDownload:true
    });
  } catch(_) {}

  // --- Cache tout ce qui ne doit jamais apparaître
  const HIDE = [
    // overlays/menus
    'pageNavOverlay','pageNavigationOverlay',
    'toolsHeader','toolsOverlay',
    'notesPanelButton','toggleNotesButton','toggleNotesPanelButton',
    'searchButton','settingsButton','menuButton','ribbonsDropdownButton',
    // anciens outils
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton','myFullscreenButton'
  ];
  function hideAll(){
    try {
      UI.disableElements && UI.disableElements(HIDE);
      HIDE.forEach(id => UI.updateElement && UI.updateElement(id,{hidden:true, disabled:true}));
      UI.closeElements && UI.closeElements(['pageNavOverlay','pageNavigationOverlay','toolsHeader','toolsOverlay']);
    } catch(_){}
  }

  // --- Vide totalement la barre du haut (pas d’icône du tout)
  function clearHeader(){
    try {
      UI.setHeaderItems(header => {
        header.getItems().forEach(it => header.delete(it.dataElement));
      });
    } catch(_){}
  }

  // --- Monte/branche la barre flottante
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
      const page = dv.getCurrentPage ? dv.getCurrentPage() : 1;
      const max  = dv.getPageCount ? dv.getPageCount() : 1;
      switch (act) {
        case 'zin':  UI.zoomIn && UI.zoomIn(); break;
        case 'zout': UI.zoomOut && UI.zoomOut(); break;
        case 'first': dv.setCurrentPage && dv.setCurrentPage(1); break;
        case 'prev':  dv.setCurrentPage && dv.setCurrentPage(Math.max(1, page - 1)); break;
        case 'next':  dv.setCurrentPage && dv.setCurrentPage(Math.min(max, page + 1)); break;
        case 'last':  dv.setCurrentPage && dv.setCurrentPage(max); break;
        case 'fs':    UI.enterFullscreen && UI.enterFullscreen(); break;
      }
    });
  }

  // --- Appliquer maintenant + surveiller les recompositions
  function applyAll(){ hideAll(); clearHeader(); mountToolbar(); }
  applyAll();
  setTimeout(applyAll, 150);
  setTimeout(applyAll, 500);

  const obs = new MutationObserver(applyAll);
  obs.observe(document.body, { childList:true, subtree:true, attributes:true });

  // --- Mobile : couverture + scroll par page + FitWidth
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(_){}
    try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(_){}
    try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(_){}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(_){}
    try { Core.documentViewer.setCurrentPage(1); } catch(_){}
    applyAll();
  });

  UI.setTheme && UI.setTheme('light');
});
