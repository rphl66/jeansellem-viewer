// =========================================================
// JEANSELLEM — PDF Viewer (UI settings, robuste)
// Fichier : pdfjs/config.js
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { UI } = instance;

  // 1) Verrous "fonctionnels" (empêche print / download / file picker partout)
  UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true
  });

  // 2) Liste élargie d'IDs à masquer (inclut alias & overlays)
  const HIDE_IDS = [
    // Action / menu
    'downloadButton', 'downloadFileButton',
    'printButton',
    'themeChangeButton',
    'languageButton',

    // Tools
    'selectToolButton', 'textSelectToolButton',
    'panToolButton',

    // Rotate (header + overlay de manipulation de page)
    'rotateClockwiseButton',
    'rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise',
    'pageManipulationOverlayRotateCounterClockwise'
  ];

  function applyHiding() {
    try {
      UI.disableElements(HIDE_IDS);
      // Ceinture + bretelles : cache aussi via updateElement
      HIDE_IDS.forEach(id => {
        UI.updateElement(id, { hidden: true, disabled: true });
      });
    } catch (e) {
      // no-op
    }
  }

  // 3) Appliquer immédiatement + ré-appliquer si l'UI se recompose
  applyHiding();
  setTimeout(applyHiding, 0);
  setTimeout(applyHiding, 300);

  // Observer les mutations de l'UI pour ré-appliquer si nécessaire
  const root = UI.getRootElement && UI.getRootElement();
  if (root) {
    const mo = new MutationObserver(() => applyHiding());
    mo.observe(root, { childList: true, subtree: true, attributes: true });
  }

  // 4) Ajouter le bouton plein écran (utile)
  UI.setHeaderItems(header => {
    header.push({ type: 'actionButton', dataElement: 'fullscreenButton' });
  });

  // 5) Forcer le thème sombre (cohérent avec viewer.css)
  UI.setTheme('dark');
});
