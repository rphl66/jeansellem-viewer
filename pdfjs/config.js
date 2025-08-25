// Ce code tourne DANS l'iframe du viewer (pas de souci cross-origin)
instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  // Masquer les éléments inutiles
  instance.UI.disableElements([
    'printButton',
    'downloadButton',
    'shareButton',
    'themeChangeButton',          // Light/Dark mode
    'languageButton',
    'selectToolButton',
    'panToolButton',
    'rotateClockwiseButton',
    'rotateCounterClockwiseButton'
  ]);

  // Ajouter un bouton plein écran natif (au cas où masqué par le thème)
  instance.UI.setHeaderItems(header => {
    header.push({ type: 'actionButton', dataElement: 'fullscreenButton' });
  });

  // Si besoin, tu peux forcer le thème sombre aussi en JS :
  // instance.UI.setTheme('dark');
});
