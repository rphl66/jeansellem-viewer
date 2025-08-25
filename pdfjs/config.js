// =========================================================
// JEANSELLEM — PDF Viewer (UI settings • fullscreen dans la barre)
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI } = instance;

  // Verrous fonctionnels
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // Cacher éléments indésirables (et alias possibles)
  const HIDE_IDS = [
    'downloadButton','downloadFileButton',
    'printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',

    // menu disposition : on ne garde que Continuous Page & Single Page
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',

    // ancien bouton fullscreen par défaut
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

  // Re-appliquer si l'UI se recompose
  const root = UI.getRootElement && UI.getRootElement();
  if (root) new MutationObserver(hideAll).observe(root, { childList: true, subtree: true, attributes: true });

  // Icône SVG inline pour un vrai bouton de barre (sinon il part en overlay)
  const fullscreenSVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'xmlns="http://www.w3.org/2000/svg"><path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round"/></svg>';

  // Réorganiser la barre : zoom -, % , zoom +, puis NOTRE bouton fullscreen
  UI.setHeaderItems(header => {
    header.push(
      { type: 'zoomOutButton' },
      { type: 'zoomDropdown' },
      { type: 'zoomInButton' },
      {
        type: 'actionButton',
        dataElement: 'myFullscreenButton',
        title: 'Full screen',
        img: fullscreenSVG,                     // ← icône inline = bouton de barre
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  // Thème clair (adapté à ton CSS ci-dessous)
  UI.setTheme('light');
});
