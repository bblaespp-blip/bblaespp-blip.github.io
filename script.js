let nsfwUnlocked = false;
let currentComicType = 'SFW';

function renderImages(targetEl, imgList, altText = "Ilustración") {
  targetEl.innerHTML = imgList.map(src => 
    `<div class="image-container"><img src="${src}" loading="lazy" alt="${altText}" onclick="openModal('${src}')"></div>`
  ).join('');
}

function setView(activeBtn, ...visibleElements) {
  [document.getElementById("gallery"), document.getElementById("comicsContainer"), document.getElementById("infoSection"), document.getElementById("backBtnContainer")]
    .forEach(el => el.classList.add("hidden"));
  
  visibleElements.forEach(el => el.classList.remove("hidden"));
  document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
  if (activeBtn) (activeBtn.currentTarget || activeBtn).classList.add("active");
}

function loadImages(cat, e) {
  const gallery = document.getElementById("gallery");
  renderImages(gallery, GALERIA[cat.toUpperCase()] || [], "Betto Blaespp");
  setView(e, gallery);
}

function showComicFolders(type = 'SFW', e) {
  currentComicType = type;
  const isNSFW = type === 'NSFW';
  const targetList = isNSFW ? GALERIA.comicsNSFW : GALERIA.comicsSFW;
  const activeBtn = isNSFW ? document.getElementById('btn-nsfw') : document.getElementById('btn-comics');
  const gallery = document.getElementById("gallery");
  const container = document.getElementById("comicsContainer");

  if (isNSFW && GALERIA.NSFW.length) {
    renderImages(gallery, GALERIA.NSFW, "NSFW Betto Blaespp");
    gallery.classList.remove("hidden");
  }

  container.innerHTML = targetList.map(comic => `
    <div class="folder-card" onclick="openComicPages('${comic.id}', '${type}')">
      <img src="${comic.cover}" loading="lazy" alt="${comic.title}">
      <div class="folder-info">
        <div class="folder-title">${comic.title}</div>
        <div class="folder-count">📖 ${comic.pages.length} Páginas</div>
      </div>
    </div>
  `).join('');

  setView(e || activeBtn, container, ...(isNSFW && GALERIA.NSFW.length ? [gallery] : []));
}

function openComicPages(comicId, type = 'SFW') {
  const targetList = type === 'NSFW' ? GALERIA.comicsNSFW : GALERIA.comicsSFW;
  const comic = targetList.find(c => c.id === comicId);
  if (!comic) return;
  
  const gallery = document.getElementById("gallery");
  renderImages(gallery, comic.pages, comic.title);
  setView(type === 'NSFW' ? document.getElementById('btn-nsfw') : document.getElementById('btn-comics'), gallery, document.getElementById("backBtnContainer"));
}

function showInfo(e) { 
  setView(e || document.getElementById('btn-info'), document.getElementById("infoSection")); 
}

function askNSFW(e) {
  if (nsfwUnlocked || confirm("🔞 Contenido para adultos (+18). ¿Deseas continuar?")) {
    nsfwUnlocked = true;
    showComicFolders('NSFW', e);
  }
}

function openModal(src) { 
  document.getElementById('modalImg').src = src; 
  document.getElementById('modal').classList.remove('hidden'); 
}

function closeModal() { 
  document.getElementById('modal').classList.add('hidden'); 
}

window.addEventListener('keydown', e => e.key === 'Escape' && closeModal());

// INICIALIZACIÓN AUTOMÁTICA Y CONTADORES
(function updateCounters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat && GALERIA[cat]) {
      btn.textContent = `${cat === 'NSFW' ? 'NSFW 🔞' : cat} (${GALERIA[cat].length})`;
    }
  });

  const totalPagesSFW = GALERIA.comicsSFW.reduce((a, b) => a + b.pages.length, 0);
  document.getElementById('btn-comics').textContent = `CÓMICS (${totalPagesSFW})`;
})();
