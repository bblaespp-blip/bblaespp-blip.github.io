let nsfwUnlocked = false;
let currentComicType = 'SFW';

// LISTA DE EXTENSIONES COMPATIBLES
const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];

// FUNCIÓN PARA CARGAR IMÁGENES PROBANDO CUALQUIER EXTENSIÓN AUTOMÁTICAMENTE
function cargarImagenMultiExt(elementId, nombreBase) {
  const imgEl = document.getElementById(elementId);
  if (!imgEl) return;

  let index = 0;

  function intentarCargar() {
    if (index >= EXTENSIONES.length) {
      imgEl.style.display = 'none'; // Si no encuentra ninguna, oculta el elemento silenciosamente
      return;
    }
    imgEl.style.display = 'block';
    imgEl.onerror = () => {
      index++;
      intentarCargar();
    };
    imgEl.src = `${nombreBase}.${EXTENSIONES[index]}`;
  }

  intentarCargar();
}

// CAMBIA ENTRE SFW Y NSFW SIN IMPORTAR LA EXTENSIÓN
function cambiarTema(modo) {
  if (modo === 'NSFW') {
    cargarImagenMultiExt('portada-img', 'portada_nsfw');
    cargarImagenMultiExt('avatar-img', 'avatar_nsfw');
  } else {
    cargarImagenMultiExt('portada-img', 'portada');
    cargarImagenMultiExt('avatar-img', 'avatar');
  }
}

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
  cambiarTema(cat === 'NSFW' ? 'NSFW' : 'SFW');

  const gallery = document.getElementById("gallery");
  renderImages(gallery, GALERIA[cat.toUpperCase()] || [], "Betto Blaespp");
  setView(e, gallery);
}

function showComicFolders(type = 'SFW', e) {
  cambiarTema(type);

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
  cambiarTema(type);

  const targetList = type === 'NSFW' ? GALERIA.comicsNSFW : GALERIA.comicsSFW;
  const comic = targetList.find(c => c.id === comicId);
  if (!comic) return;
  
  const gallery = document.getElementById("gallery");
  renderImages(gallery, comic.pages, comic.title);
  setView(type === 'NSFW' ? document.getElementById('btn-nsfw') : document.getElementById('btn-comics'), gallery, document.getElementById("backBtnContainer"));
}

function showInfo(e) { 
  cambiarTema('SFW');
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
(function init() {
  // Carga inicial dinámica
  cambiarTema('SFW');

  // Contadores
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat && GALERIA[cat]) {
      btn.textContent = `${cat === 'NSFW' ? 'NSFW 🔞' : cat} (${GALERIA[cat].length})`;
    }
  });

  const totalPagesSFW = GALERIA.comicsSFW.reduce((a, b) => a + b.pages.length, 0);
  document.getElementById('btn-comics').textContent = `CÓMICS (${totalPagesSFW})`;
})();
