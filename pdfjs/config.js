// =========================================================
// JEANSELLEM — PDF Viewer (UI settings, robuste)
// Garde : Continuous Page + Single Page uniquement
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI, Core } = instance;

  // Verrous fonctionnels
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // Eléments à masquer par dataElement (header, overlays, etc.)
  const HIDE_IDS = [
    'downloadButton','downloadFileButton',
    'printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',

    // Menu "View Controls" : on ne garde que Continuous + Single
    'pageByPageButton',
    'doublePageButton',
    'coverFacingButton',
    'pageOrientationButton',

    // Ancien fullscreen (on insère le nôtre)
    'fullscreenButton'
  ];

  function hideById() {
    try {
      UI.disableElements(HIDE_IDS);
      HIDE_IDS.forEach(id => UI.updateElement(id, { hidden: true, disabled: true }));
    } catch (_) {}
  }

  // Secours : si un item n'a pas d'ID connu, on supprime par son libellé
  const KILL_TEXTS = new Set([
    'Page by Page',
    'Page Orientation',
    'Page Layout',
    'Double Page',
    'Cover Facing Page'
  ]);
  function hideByText() {
    // cherche les overlays possibles
    const overlays = document.querySelectorAll(
      '[data-element="viewControlsOverlay"], .viewControlsOverlay, .Overlay, .Menu'
    );
    overlays.forEach(ov => {
      ov.querySelectorAll('*').forEach(el => {
        const t = (el.textContent || '').trim();
        if (KILL_TEXTS.has(t)) {
          const block = el.closest('[data-element], .Menu, .Row, li, button') || el;
          block.style.display = 'none';
        }
      });
    });
  }

  // Appliquer maintenant + après petit délai (recompositions)
  const applyAll = () => { hideById(); hideByText(); };
  applyAll();
  setTimeout(applyAll, 200);
  setTimeout(applyAll, 600);

  // Observer l'UI + <body> (certains overlays sont portés)
  const obsOpts = { childList: true, subtree: true, attributes: true };
  const roots = [UI.getRootElement && UI.getRootElement(), document.body].filter(Boolean);
  roots.forEach(r => new MutationObserver(applyAll).observe(r, obsOpts));

  // Re-appliquer à chaque ouverture de menus (clic / clavier)
  document.addEventListener('click', () => setTimeout(applyAll, 0), true);
  document.addEventListener('keydown', () => setTimeout(applyAll, 0), true);

  // Bouton Full screen custom avec icône → reste dans la barre
  const fullscreenSVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  UI.setHeaderItems(header => {
    header.push(
      { type: 'zoomOutButton' },
      { type: 'zoomDropdown' },
      { type: 'zoomInButton' },
      { type: 'actionButton', dataElement: 'myFullscreenButton', title: 'Full screen', img: fullscreenSVG,
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  // Mobile : ne montrer qu'une page (couverture), scroll page par page, largeur ajustée
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(_) {}
    try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(_) {}
    try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(_) {}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(_) {}
    try { Core.documentViewer.setCurrentPage(1); } catch(_) {}
  });

  // Skin clair (ta CSS)
  UI.setTheme('light');
});
