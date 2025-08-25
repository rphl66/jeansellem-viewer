// =========================================================
// JEANSELLEM — PDF Viewer (UI settings personnalisés)
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI } = instance;

  // Désactiver fonctions natives (print, download, file picker)
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true
  });

  // Liste d’éléments à cacher
  const HIDE_IDS = [
    'downloadButton', 'downloadFileButton',
    'printButton',
    'themeChangeButton',
    'languageButton',
    'selectToolButton', 'textSelectToolButton',
    'panToolButton',
    'rotateClockwiseButton', 'rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise',
    'pageManipulationOverlayRotateCounterClockwise',

    // Supprimer les entrées du menu de disposition
    'pageTransitionButton', // "Page by Page" vs "Continuous"
    'pageOrientationButton', // orientation
    'doublePageButton',
    'coverFacingButton'
  ];

  function applyHiding() {
    try {
      UI.disableElements(HIDE_IDS);
      HIDE_IDS.forEach(id => {
        UI.updateElement(id, { hidden: true, disabled: true });
      });
    } catch (e) {}
  }
  applyHiding();
  setTimeout(applyHiding, 300);

  // Observer pour re-appliquer si besoin
  const root = UI.getRootElement && UI.getRootElement();
  if (root) {
    const mo = new MutationObserver(() => applyHiding());
    mo.observe(root, { childList: true, subtree: true, attributes: true });
  }

  // Réorganiser la barre d’outils
  UI.setHeaderItems(header => {
    // header contient les groupes (zoom, search, etc.)
    // Ici on insère Fullscreen après le zoom
    const items = [
      { type: 'zoomOutButton' },
      { type: 'zoomDropdown' },
      { type: 'zoomInButton' },
      { type: 'actionButton', dataElement: 'fullscreenButton' } // ajouté ici
    ];
    header.push(...items);
  });

  // Thème sombre
  UI.setTheme('dark');
});
