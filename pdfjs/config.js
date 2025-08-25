// =========================================================
// JEANSELLEM — PDF Viewer (UI settings, clair + fullscreen custom)
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI } = instance;

  // Verrous fonctionnels
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // Cacher les éléments indésirables
  const HIDE_IDS = [
    'downloadButton','downloadFileButton',
    'printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',

    // Menu disposition : on ne garde que Continuous Page & Single Page
    'pageByPageButton',
    'doublePageButton',
    'coverFacingButton',
    'pageOrientationButton',

    // Ancien bouton fullscreen
    'fullscreenButton'
  ];

  function hideAll() {
    try {
      UI.disableElements(HIDE_IDS);
      HIDE_IDS.forEach(id => UI.updateElement(id, { hidden: true, disabled: true }));
    } catch (e) {}
  }
  hideAll();
  setTimeout(hideAll, 250);

  // Observer re-render
  const root = UI.getRootElement && UI.getRootElement();
  if (root) {
    new MutationObserver(hideAll).observe(root, { childList: true, subtree: true, attributes: true });
  }

  // Réorganiser barre d’outils avec bouton fullscreen custom
  UI.setHeaderItems(header => {
    header.push(
      { type: 'zoomOutButton' },
      { type: 'zoomDropdown' },
      { type: 'zoomInButton' },
      {
        type: 'actionButton',
        dataElement: 'myFullscreenButton', // identifiant unique
        title: 'Full screen',
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  // Forcer le thème clair (adapté à ton CSS)
  UI.setTheme('light');
});
