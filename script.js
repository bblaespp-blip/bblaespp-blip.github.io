let nsfwUnlocked = false;
let currentComicType = 'SFW';

// 🔄 DICCIONARIO DE IMÁGENES DE PORTADA Y AVATAR
// Puedes cambiar las extensiones aquí si tus archivos se llaman distinto (.png, .webp, .jpeg)
const TEMAS = {
  SFW: {
    portada: "portada.jpg",
    avatar: "avatar.jpg"
  },
  NSFW: {
    portada: "portada_nsfw.jpg",
    avatar: "avatar_nsfw.jpg"
  }
};

// 🔄 FUNCIÓN PARA CAMBIAR PORTADA Y AVATAR DINÁMICAMENTE
function cambiarTema(modo) {
  const root = document.documentElement;
  const avatar = document.getElementById('avatar-img');
  const config = TEMAS[modo] || TEMAS.SFW;

  // Cambiar la imagen del banner superior (Portada)
  root.style.setProperty('--bg-portada', `url('${config.portada}')`);

  // Cambiar la imagen del avatar circular
  if (avatar) {
    // Si la imagen cambia de modo, reiniciamos el dataset de intentos de carga (onerror)
    avatar.dataset.retry = '';
    avatar.src = config.avatar;
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
  // Cambia el tema según la categoría (NSFW o SFW)
  cambiarTema(cat === 'NSFW' ? 'NSFW' : 'SFW');

  const gallery = document.getElementById("gallery");
  renderImages(gallery, GALERIA[cat.toUpperCase()] || [], "Betto Blaespp");
  setView(e, gallery);
}

function showComicFolders(type = 'SFW', e) {
  // Cambia el tema al entrar a cómics SFW o NSFW
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
  cambiarTema('SFW'); // Regresa al tema normal al estar en Inicio / Sobre mí
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
