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

  // Bouton plein écran (si jamais masqué par le thème)
  instance.UI.setHeaderItems(header => {
    header.push({ type: 'actionButton', dataElement: 'fullscreenButton' });
  });

  // Forcer le thème sombre pour refléter viewer.css
  instance.UI.setTheme('dark');
});
