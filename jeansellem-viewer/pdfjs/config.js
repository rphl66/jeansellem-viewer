// Ce code tourne DANS l'iframe du viewer (pas de souci cross-origin)
instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  // Exemples de custom UI :
  instance.UI.disableElements(['printButton', 'downloadButton', 'shareButton']);

  // Ajouter un bouton plein écran natif (au cas où masqué par le thème)
  instance.UI.setHeaderItems(header => {
    header.push({ type: 'actionButton', dataElement: 'fullscreenButton' });
  });

  // Tu peux aussi définir le thème via CSS (voir viewer.css)
  // instance.UI.setTheme('dark');
});
