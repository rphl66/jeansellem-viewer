// ---------------------------------------------------------
// JEANSELLEM — UIConfig (v23)
// Nettoyage barre du haut + cache le compteur de pages
// + barre flottante interne
// ---------------------------------------------------------
window.addEventListener('viewerLoaded', () => {
  const { UI, Core } = window.instance;

  // Badge debug 3 s (optionnel)
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

  // Réglages de base
  UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);
  UI.setFeatureFlags?.({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // Tout ce qu’on masque (barre du haut + overlay pages)
  const HIDE = [
    'downloadButton','downloadFileButton','printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton',                         // ancien FS par défaut

    // haut-droite inutiles
    'searchButton',
    'toggleNotesButton','toggleNotesPanelButton','notesPanelButton',
    'settingsButton','menuButton','ribbonsDropdownButton',

    // petit overlay pagination “x/xx”
    'pageNavOverlay','pageNavigationOverlay'
  ];

  try {
    UI.disableElements(HIDE);
    HIDE.forEach(id => UI.updateElement?.(id, { hidden:true, disabled:true }));
    UI.closeElements?.(['pageNavOverlay','pageNavigationOverlay']);
  } catch(e){}

  // Barre du haut : zoom -, %, + + bouton FS personnalisé
  const fsSVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  UI.setHeaderItems(header => {
    header.length = 0; // on repart propre
    header.push(
      { type:'zoomOutButton' },
      { type:'zoomDropdown' },
      { type:'zoomInButton' },
      { type:'actionButton', dataElement:'myFullscreenButton', title:'Plein écran', img: fsSVG,
        onClick: () => UI.enterFullscreen() }
    );
  });

  UI.setTheme('light');

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

  // Ceinture + bretelles : re-masquer le pager après recomposition
  setTimeout(() => UI.disableElements?.(['pageNavOverlay','pageNavigationOverlay']), 300);
});
