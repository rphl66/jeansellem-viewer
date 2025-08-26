/* =========================================================
   JEANSELLEM — UIConfig (UI + barre flottante) v24
   ========================================================= */
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // Badge debug 3 s
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v24 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b);
    setTimeout(()=> b.remove(), 3000);
  }

  // Verrous (optionnels selon la version)
  if (typeof UI.setFeatureFlags === 'function') {
    UI.setFeatureFlags({ disableLocalFilePicker: true, disablePrint: true, disableDownload: true });
  }

  // Forcer la barre "View" si dispo
  if (typeof UI.setToolbarGroup === 'function' && UI.ToolbarGroup?.View) {
    UI.setToolbarGroup(UI.ToolbarGroup.View);
  }

  // Cacher éléments/menus
  const HIDE_IDS = [
    'downloadButton','downloadFileButton','printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton',
    // Groupes annotation
    'toolbarGroupButton','toolbarGroup-Annotate','toolbarGroup-Edit','toolbarGroup-Forms',
    'toolbarGroup-Insert','toolbarGroup-Measure','toolbarGroup-Shapes',
    'toolsHeader','toolsOverlay','toolStylePopup','stylePopup','annotationStylePopup',
    'notesPanelButton','toggleNotesButton','toggleNotesPanelButton','commentsPanelButton'
  ];
  try {
    UI.disableElements(HIDE_IDS);
    HIDE_IDS.forEach(id => UI.updateElement(id, { hidden:true, disabled:true }));
    UI.closeElements && UI.closeElements(['toolsHeader','toolStylePopup','stylePopup']);
  } catch {}

  // Pas d’outil d’annotation actif
  try { UI.setToolMode && UI.setToolMode(Core?.Tools?.ToolNames?.PAN); } catch {}

  // Bouton FS dans la barre native
  const fullscreenSVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'+
    '<path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'+
    '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  UI.setHeaderItems(header => {
    header.push(
      { type:'zoomOutButton' },
      { type:'zoomDropdown' },
      { type:'zoomInButton' },
      { type:'actionButton', dataElement:'myFullscreenButton', title:'Full screen', img: fullscreenSVG,
        onClick: () => enterFullscreen()
      }
    );
  });

  // Helpers zoom & fullscreen robustes
  const dv = Core.documentViewer;
  const getZoom = () =>
    (typeof dv.getZoomLevel === 'function' && dv.getZoomLevel()) || 1;
  const setZoom = (z) => {
    try {
      if (typeof dv.setZoomLevel === 'function') dv.setZoomLevel(z);
      else if (typeof dv.zoomTo === 'function') dv.zoomTo(z);
      else if (typeof UI.setZoomLevel === 'function') UI.setZoomLevel(z);
      else if (typeof UI.zoomTo === 'function') UI.zoomTo(z);
    } catch {}
  };
  function enterFullscreen() {
    try { if (UI.enterFullscreen) return UI.enterFullscreen(); } catch {}
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen ||
                el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el);
  }

  // Mobile : couverture + page-by-page + FitWidth
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (isMobile) {
      try { UI.setLayoutMode(UI.LayoutMode.Single); } catch {}
      try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch {}
      try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch {}
      try { UI.setFitMode(UI.FitMode.FitWidth); } catch {}
      try { Core.documentViewer.setCurrentPage(1); } catch {}
    }
  });

  UI.setTheme('light');

  // ===== Barre flottante (montée après chargement du document) =====
  function buildToolbar() {
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

    // Actions
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn'); if (!btn) return;
      const act = btn.dataset.act;
      const page = dv.getCurrentPage ? dv.getCurrentPage() : 1;
      const max  = dv.getPageCount ? dv.getPageCount() : 1;

      switch (act) {
        case 'zin':  setZoom(Math.min(8,  getZoom() * 1.1)); break;
        case 'zout': setZoom(Math.max(0.25, getZoom() / 1.1)); break;
        case 'first': dv.setCurrentPage && dv.setCurrentPage(1); break;
        case 'prev':  dv.setCurrentPage && dv.setCurrentPage(Math.max(1, page - 1)); break;
        case 'next':  dv.setCurrentPage && dv.setCurrentPage(Math.min(max, page + 1)); break;
        case 'last':  dv.setCurrentPage && dv.setCurrentPage(max); break;
        case 'fs':    enterFullscreen(); break;
      }
    });
  }

  // Monter la barre quand le doc est prêt (et réessayer si l’UI se recompose)
  const mount = () => buildToolbar();
  if (Core.documentViewer.getDocument()) mount();
  else Core.documentViewer.addEventListener('documentLoaded', mount, { once:true });

  new MutationObserver(mount).observe(document.body, { childList:true, subtree:true });
  Core.documentViewer.addEventListener('pagesUpdated', mount);
  Core.documentViewer.addEventListener('layoutChanged', mount);
});
