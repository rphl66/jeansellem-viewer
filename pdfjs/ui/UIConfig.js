// =========================================================
// JEANSELLEM — UIConfig (UI + barre flottante obstinée) v27
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // --- Badge debug (3 s) -------------------------------
  try {
    const id = 'jsl-debug';
    if (!document.getElementById(id)) {
      const b = document.createElement('div');
      b.id = id;
      b.textContent = 'JSL UI v27 OK';
      Object.assign(b.style, {
        position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
        background:'#222', color:'#fff', font:'12px/1.2 monospace',
        padding:'4px 6px', borderRadius:'6px', opacity:'0.9'
      });
      document.body.appendChild(b);
      setTimeout(()=> b.remove(), 3000);
    }
  } catch(e){}

  // --- Nettoyage total de la barre du haut --------------
  try {
    UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);
    UI.setHeaderItems(h => { h.splice(0, h.length); });

    const HIDE = [
      'toolbarGroupButton','toolsHeader','toolsOverlay',
      'notesPanel','notesPanelButton','toggleNotesButton','toggleNotesPanelButton',
      'ribbonsDropdownButton','menuButton','settingsButton','searchButton',
      'pageNavOverlay','pageNavigationOverlay',
      'downloadButton','downloadFileButton','printButton','openFileButton','shareButton',
      'languageButton','themeChangeButton',
      'selectToolButton','textSelectToolButton','panToolButton',
      'rotateClockwiseButton','rotateCounterClockwiseButton',
      'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
      'fullscreenButton'
    ];
    UI.disableElements && UI.disableElements(HIDE);
    HIDE.forEach(id => UI.updateElement?.(id, { hidden:true, disabled:true }));
    UI.closeElements?.(['toolsHeader','toolStylePopup','stylePopup','pageNavOverlay','pageNavigationOverlay']);
  } catch(e){}

  UI.setTheme?.('light');

  // --- Réglages mobiles à l’ouverture du PDF ------------
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
    try { UI.setScrollMode?.(UI.ScrollMode.PAGE); } catch(e){}
    try { UI.setPageTransitionMode?.(UI.PageTransitionMode.PAGE); } catch(e){}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e){}
    try { Core.documentViewer.setCurrentPage(1); } catch(e){}
  });

  // --- BARRE FLOTTANTE (avec styles inline) -------------
  function mountToolbar(){
    if (document.getElementById('jsl-toolbar')) return;

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    // style container
    Object.assign(bar.style, {
      position:'fixed',
      left:'50%',
      bottom:'calc(16px + env(safe-area-inset-bottom, 0px))',
      transform:'translateX(-50%)',
      display:'inline-flex',
      alignItems:'center',
      gap:'10px',
      padding:'8px 12px',
      background:'rgba(255,255,255,0.95)',
      color:'#000',
      borderRadius:'10px',
      boxShadow:'0 6px 16px rgba(0,0,0,.15)',
      border:'1px solid rgba(0,0,0,.08)',
      zIndex:'2147483647',
      backdropFilter:'blur(6px)',
      WebkitBackdropFilter:'blur(6px)'
    });

    // fabrique un bouton
    const mkBtn = (label, act) => {
      const btn = document.createElement('button');
      btn.className = 'jsl-btn';
      btn.dataset.act = act;
      btn.textContent = label;
      Object.assign(btn.style, {
        width:'36px', height:'36px',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        background:'transparent', color:'inherit',
        border:'0', borderRadius:'8px', cursor:'pointer', fontSize:'16px'
      });
      btn.onmouseenter = () => btn.style.background = 'rgba(0,0,0,.06)';
      btn.onmouseleave = () => btn.style.background = 'transparent';
      return btn;
    };

    const sep = () => {
      const s = document.createElement('span');
      Object.assign(s.style, { width:'1px', height:'24px', background:'rgba(0,0,0,.15)', margin:'0 4px' });
      return s;
    };

    // boutons
    const btns = [
      mkBtn('−','zout'),
      mkBtn('+','zin'),
      sep(),
      mkBtn('⏮︎','first'),
      mkBtn('◀︎','prev'),
      mkBtn('▶︎','next'),
      mkBtn('⏭︎','last'),
      sep(),
      (()=>{ const b=mkBtn('⤢','fs'); b.style.background='#000'; b.style.color='#fff'; return b; })(),
    ];
    btns.forEach(b => bar.appendChild(b));

    (document.getElementById('app') || document.body).appendChild(bar);
    console.debug('[JSL] Barre flottante montée');

    // actions (Core pour éviter toute promesse cross-domain)
    const dv = Core.documentViewer;
    const zoomStep = 1.1;

    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn'); if (!btn) return;
      const act = btn.dataset.act;
      const page = dv.getCurrentPage ? dv.getCurrentPage() : 1;
      const max  = dv.getPageCount ? dv.getPageCount() : 1;

      try {
        switch (act) {
          case 'zin':  dv.zoomTo(dv.getZoomLevel() * zoomStep); break;
          case 'zout': dv.zoomTo(dv.getZoomLevel() / zoomStep); break;
          case 'first': dv.setCurrentPage?.(1); break;
          case 'prev':  dv.setCurrentPage?.(Math.max(1, page - 1)); break;
          case 'next':  dv.setCurrentPage?.(Math.min(max, page + 1)); break;
          case 'last':  dv.setCurrentPage?.(max); break;
          case 'fs':
            (UI.enterFullscreen && UI.enterFullscreen())
              || document.documentElement.requestFullscreen?.();
            break;
        }
      } catch(err){
        console.warn('[JSL] Action toolbar erreur:', act, err);
      }
    });
  }

  // --- Remontage obstiné --------------------------------
  function ensureToolbarMounted() {
    if (!document.getElementById('jsl-toolbar')) mountToolbar();
  }

  // 1) maintenant
  ensureToolbarMounted();
  // 2) à l’ouverture d’un doc
  Core.documentViewer.addEventListener('documentLoaded', ensureToolbarMounted);
  // 3) si le DOM change (ex: éditeur Squarespace)
  new MutationObserver(ensureToolbarMounted).observe(document.body, { childList:true, subtree:true });
  // 4) rappels
  setTimeout(ensureToolbarMounted, 600);
  setTimeout(ensureToolbarMounted, 1500);
  const id = setInterval(ensureToolbarMounted, 2000);
  setTimeout(() => clearInterval(id), 20000); // on arrête après 20s
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(ensureToolbarMounted, 250);
  });
});
