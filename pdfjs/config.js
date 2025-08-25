// =========================================================
// JEANSELLEM — PDF Viewer (UI settings)
// Fichier : pdfjs/config.js
// =========================================================

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  // Masquer les éléments inutiles
  instance.UI.disableElements([
    'downloadButton',              // Télécharger
    'printButton',                 // Imprimer
    'themeChangeButton',           // Light/Dark mode
    'languageButton',              // Langue
    'selectToolButton',            // Outil Sélection
    'panToolButton',               // Outil Main
    'rotateClockwiseButton',       // Rotation horaire
    'rotateCounterClockwiseButton' // Rotation anti-horaire
  ]);

  // Désactiver les fonctions natives (menu contextuel & raccourcis)
  instance.UI.setFeatureFlags({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true
  });

  // Ajouter bouton plein écran
  instance.UI.setHeaderItems(header => {
    header.push({ type: 'actionButton', dataElement: 'fullscreenButton' });
  });

  // Forcer le thème sombre (pour cohérence avec viewer.css)
  instance.UI.setTheme('dark');
});
