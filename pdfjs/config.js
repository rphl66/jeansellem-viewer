// =========================================================
// JEANSELLEM — PDF Viewer (UI settings • nettoyage menus)
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI } = instance;

  // Verrous fonctionnels
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // On cache ce qu'on ne veut pas voir via dataElement (si dispo)
  const HIDE_IDS = [
    'downloadButton','downloadFileButton',
    'printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',

    // menu disposition : garder seulement Continuous & Single
    'pageByPageButton',
    'doublePageButton',
    'coverFacingButton',
    'pageOrientationButton',

    // ancien bouton fullscreen par défaut (on utilise le nôtre)
    'fullscreenButton'
  ];

  const hideAll = () => {
    try {
      UI.disableElements(HIDE_IDS);
      HIDE_IDS.forEach(id => UI.updateElement(id, { hidden: true, disabled: true }));
    } catch (e) {}
  };
  hideAll();
  setTimeout(hideAll, 250);

  // —— Filet de sécurité : si certains items n'ont pas de dataElement connu,
  // on les retire par leur texte (anglais ici). Ça marche même après re-rendu.
  const KILL_TEXTS = new Set([
    'Page by Page',
    'Page Orientation',
    'Page Layout',
    'Double Page',
    'Cover Facing Page'
  ]);
  const pruneByText = () => {
    const overlay =
      document.querySelector('[data-element="viewControlsOverlay"]') ||
      document.querySelector('.viewControlsOverlay') ||
      document.querySelector('.Overlay');
    if (!overlay) return;
    overlay.querySelectorAll('*').forEach(el => {
      const t = (el.textContent || '').trim();
      if (KILL_TEXTS.has(t)) {
        const block = el.closest('[data-element], .Menu, .Row, li, button') || el;
        block.style.display = 'none';
      }
    });
  };
  pruneByText();
  setTimeout(pruneByText, 250);

  // Observer le DOM pour ré-appliquer si l’UI se recompose
  const root = UI.getRootElement && UI.getRootElement();
  if (root) {
    new MutationObserver(() => { hideAll(); pruneByText(); })
      .observe(root, { childList: true, subtree: true, attributes: true });
  }

  // Icône SVG inline → le bouton reste dans la barre
  const fullscreenSVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  // Réorganiser : zoom -, %, +, puis NOTRE bouton Full screen custom
  UI.setHeaderItems(header => {
    header.push(
      { type: 'zoomOutButton' },
      { type: 'zoomDropdown' },
      { type: 'zoomInButton' },
      {
        type: 'actionButton',
        dataElement: 'myFullscreenButton',
        title: 'Full screen',
        img: fullscreenSVG,
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  UI.setTheme('light'); // cohérent avec ton skin clair
});
// ----- Réglages spécifiques mobile : 1 page à la fois + FitWidth -----
  const isMobile = matchMedia('(max-width: 768px)').matches;

  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;

    // 1) Une page à la fois
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e) {}

    // 2) Page-by-Page (pas en continu)
    try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(e) {}
    try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(e) {}

    // 3) Ajuster l'affichage pour remplir la largeur de l'écran
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e) {}

    // 4) Se placer sur la page 1, au cas où
    try { Core.documentViewer.setCurrentPage(1); } catch(e) {}
  });
});
