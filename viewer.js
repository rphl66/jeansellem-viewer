// === Viewer pour les blocs générés .dv ===
document.querySelectorAll('.event-archive-block').forEach(block => {
  const configScript = block.querySelector('.dv-config');
  if (!configScript) return;
  const config = JSON.parse(configScript.textContent);
  const container = block.querySelector('.dossier-viewer');
  const grid = document.createElement('div');
  grid.className = 'dv-grid';

  config.items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'dv-item';
    el.innerHTML = `
      <div class="dv-thumb"><img src="${item.thumb}" /></div>
      <div class="dv-meta">
        <div class="dv-title">${item.title || ''}</div>
        <div class="dv-date">${item.date || ''}</div>
        <div class="dv-type">${item.type || ''}</div>
      </div>
    `;
    el.onclick = () => openViewer(item);
    grid.appendChild(el);
  });

  container.appendChild(grid);

  function openViewer(item) {
    const modal = document.createElement('div');
    modal.className = 'dv-modal';
    modal.innerHTML = `
      <div class="dv-modal-inner">
        <button class="dv-close">×</button>
        <div class="dv-full">
          <img src="${item.full}" />
        </div>
        <div class="dv-caption">${item.caption || ''}</div>
      </div>
    `;
    modal.querySelector('.dv-close').onclick = () => modal.remove();
    document.body.appendChild(modal);
  }
});

