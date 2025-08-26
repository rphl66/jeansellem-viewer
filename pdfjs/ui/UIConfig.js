// =========================================================
// JEANSELLEM — PDF Viewer UIConfig (final, sans debug)
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const { UI, Core } = window.instance;

  // --- Désactivation des éléments inutiles ---
  const HIDE = [
    'downloadButton','downloadFileButton','printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton',
    'searchButton','toggleNotesButton','notesPanelButton','settingsButton',
    'menuButton','ribbonsDropdownButton',
    'pageNavOverlay','pageNavigationOverlay'
  ];
  try {
    UI.disableElements(HIDE);
    HIDE.forEach(id => UI.updateElement?.(id, { hidden:true, disabled:true }));
    UI.closeElements?.(['pageNavOverlay','pageNavigationOverlay']);
  } catch(e){}

  // --- Supprimer les items de header (vide) ---
  try {
    UI.setHeaderItems(() => []);   // barre du haut = vide
  } catch(e){}

  // --- Mode mobile : plein écran page simple ---
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

  // =========================================================
  // Barre flottante personnalisée
  // =========================================================
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

  // Montage obstiné (si DOM reconstruit par Squarespace)
  function ensureToolbarMounted() {
    if (!document.getElementById('jsl-toolbar')) {
      mountToolbar();
    }
  }
  ensureToolbarMounted();
  Core.documentViewer.addEventListener('documentLoaded', ensureToolbarMounted);
  new MutationObserver(ensureToolbarMounted).observe(document.body, { childList: true, subtree: true });
  setTimeout(ensureToolbarMounted, 600);
  setTimeout(ensureToolbarMounted, 1500);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(ensureToolbarMounted, 250);
  });
});
