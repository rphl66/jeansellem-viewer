// =========================================================
// JEANSELLEM — UIConfig (UI + barre flottante interne) v20
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // --- Badge debug 3 s (vérifie que ce fichier tourne)
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v20 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b);
    setTimeout(()=> b.remove(), 3000);
  }

  // --- Verrous
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true
  });

  // 1) Forcer la barre "View" et fermer tout ce qui est annot.
  try {
    // deux syntaxes selon les versions — on tente les deux
    UI.setToolbarGroup && UI.setToolbarGroup('toolbarGroup-View');
    UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup?.View);
  } catch(_) {}

  const HIDE_IDS = [
    'downloadButton','downloadFileButton','printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton',

    // sélecteur de groupes + barres d’outils d’annotation
    'toolbarGroupButton','toolsHeader','toolsOverlay',
    'toolStylePopup','stylePopup','annotationStylePopup',
    'notesPanelButton','toggleNotesButton','toggleNotesPanelButton','commentsPanelButton'
  ];
  try {
    UI.disableElements(HIDE_IDS);
    HIDE_IDS.forEach(id => UI.updateElement(id, { hidden:true, disabled:true }));
    UI.closeElements && UI.closeElements(['toolsHeader','toolStylePopup','stylePopup']);
    // repasse sur l’outil main pour être sûr
    UI.setToolMode && UI.setToolMode(Core.Tools.ToolNames.PAN);
  } catch(_) {}

  // 2) Bouton plein écran dans la barre native (après zooms)
  UI.setHeaderItems(header => {
    header.push(
      { type:'zoomOutButton' },
      { type:'zoomDropdown' },
      { type:'zoomInButton' },
      {
        type:'actionButton',
        dataElement:'myFullscreenButton',
        title:'Full screen',
        img:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  // 3) Mobile : couverture + page-by-page + FitWidth
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(_) {}
    try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(_) {}
    try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(_) {}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(_) {}
    try { Core.documentViewer.setCurrentPage(1); } catch(_) {}
  });

  UI.setTheme('light');

  // 4) BARRE FLOTTANTE interne (dans l’iframe)
  function ensureToolbarCSS() {
    // au cas où viewer.css n’est pas chargé, injecte un style minimal
    if (document.getElementById('jsl-toolbar-style')) return;
    const s = document.createElement('style');
    s.id = 'jsl-toolbar-style';
    s.textContent = `
      #jsl-toolbar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);
        display:inline-flex;gap:10px;padding:8px 12px;background:rgba(255,255,255,.95);
        border-radius:10px;border:1px solid rgba(0,0,0,.08);box-shadow:0 6px 16px rgba(0,0,0,.15);
        z-index:2147483647}
      #jsl-toolbar .jsl-btn{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:0;background:transparent;cursor:pointer}
      #jsl-toolbar .jsl-sep{width:1px;height:24px;background:rgba(0,0,0,.15)}
      @media (max-width:768px){#jsl-toolbar{bottom:16px}}
    `;
    document.head.appendChild(s);
  }

  function mountToolbar() {
    if (document.getElementById('jsl-toolbar')) return;
    ensureToolbarCSS();

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    bar.className = 'jsl-toolbar';
    bar.innerHTML = `
      <button class="jsl-btn" data-act="zout" title="Zoom out" aria-label="Zoom out">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <button class="jsl-btn" data-act="zin" title="Zoom in" aria-label="Zoom in">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn" data-act="first" title="Première page" aria-label="Première page">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6v12M10 6l8 6-8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button class="jsl-btn" data-act="prev" title="Page précédente" aria-label="Page précédente">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button class="jsl-btn" data-act="next" title="Page suivante" aria-label="Page suivante">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <button class="jsl-btn" data-act="last" title="Dernière page" aria-label="Dernière page">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6v12M14 6l-8 6 8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn jsl-btn-fs" data-act="fs" title="Plein écran" aria-label="Plein écran">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    // on l’ajoute DANS l’iframe
    (document.getElementById('app') || document.body).appendChild(bar);

    const dv = Core.documentViewer;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn');
      if (!btn) return;
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

  // Monter à coup sûr
  mountToolbar();
  Core.documentViewer.addEventListener('documentLoaded', () => setTimeout(mountToolbar, 0));
  setTimeout(mountToolbar, 400);
  new MutationObserver(mountToolbar).observe(document.body, { childList:true, subtree:true });
});
