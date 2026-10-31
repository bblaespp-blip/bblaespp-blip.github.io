let nsfwUnlocked = false;
let currentComicType = 'SFW';
let isAdminUnlocked = false;

const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];

function probarYAplicarImagen(nombreBase, callback) {
  let index = 0;

  function probar() {
    if (index >= EXTENSIONES.length) return;
    const ruta = `${nombreBase}.${EXTENSIONES[index]}`;
    const imgTester = new Image();

    imgTester.onload = () => {
      callback(ruta);
    };
    imgTester.onerror = () => {
      index++;
      probar();
    };
    imgTester.src = ruta;
  }

  probar();
}

function cambiarTema(modo) {
  const root = document.documentElement;
  const avatar = document.getElementById('avatar-img');
  const esNSFW = modo === 'NSFW';

  const basePortada = esNSFW ? 'portada_nsfw' : 'portada';
  const baseAvatar = esNSFW ? 'avatar_nsfw' : 'avatar';

  probarYAplicarImagen(basePortada, (rutaCorrecta) => {
    root.style.setProperty('--bg-portada', `url('${rutaCorrecta}')`);
  });

  if (avatar) {
    probarYAplicarImagen(baseAvatar, (rutaCorrecta) => {
      avatar.src = rutaCorrecta;
    });
  }
}

function renderImages(targetEl, imgList, altText = "Ilustración") {
  targetEl.innerHTML = imgList.map(src => 
    `<div class="image-container"><img src="${src}" loading="lazy" alt="${altText}" onclick="openModal('${src}')"></div>`
  ).join('');
}

function setView(activeBtn, ...visibleElements) {
  [
    document.getElementById("gallery"), 
    document.getElementById("comicsContainer"), 
    document.getElementById("infoSection"), 
    document.getElementById("backBtnContainer"),
    document.getElementById("userCommissionsGallery")
  ].forEach(el => el.classList.add("hidden"));
  
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

function sendOrder(e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value;
  const type = document.getElementById('orderType').value;
  const idea = document.getElementById('orderIdea').value;
  
  const ticketId = 'TICKET #' + Math.floor(1000 + Math.random() * 9000);

  const mensaje = `🔔 *¡NUEVO PEDIDO / TICKET!*\n\n🎫 *ID:* ${ticketId}\n👤 *Cliente:* ${name}\n🎨 *Tipo:* ${type}\n💡 *Idea:* ${idea}`;
  const phone = "573152395773";
  
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank');

  alert(`¡Pedido generado! Tu número de ticket es ${ticketId}. Revisa tu WhatsApp para enviarlo 🎉`);
  document.querySelector('.order-form').reset();
}

function pedirAccesoAdmin() {
  const password = prompt("🔒 ACCESO RESTRINGIDO (ADMIN)\nIntroduce tu contraseña para desbloquear el panel de publicaciones:");
  if (password === "BETTO2026") {
    isAdminUnlocked = true;
    alert("¡Acceso concedido, Betto! Ya puedes publicar comisiones en la pestaña Entregadas.");
    showUserCommissions();
  } else if (password !== null) {
    alert("❌ Contraseña incorrecta.");
  }
}

function showUserCommissions(e) {
  cambiarTema('SFW');
  const container = document.getElementById("userCommissionsGallery");

  const entregadasStorage = JSON.parse(localStorage.getItem('betto_entregadas')) || [];

  let htmlContenido = "";

  if (isAdminUnlocked) {
    htmlContenido += `
      <div style="grid-column: 1/-1;" class="admin-upload-box" id="adminBox">
        <h3>✨ Panel Admin: Publicar Comisión Entregada</h3>
        <input type="text" id="adminClient" placeholder="Nombre del Cliente (Ej: Carlos M.)">
        <textarea id="adminIdea" rows="2" placeholder="Idea o descripción del trabajo"></textarea>
        <input type="text" id="adminImg" placeholder="Ruta de la imagen (Ej: COMISIONES/maxsteel.png o 1.png)">
        <button class="btn-publish" onclick="publicarComisionAdmin()">🚀 Publicar en Entregadas</button>
      </div>
    `;
  }

  if (entregadasStorage.length === 0 && !isAdminUnlocked) {
    htmlContenido += `<p style="text-align:center; grid-column: 1/-1; color: var(--pink);">Pronto se publicarán las primeras comisiones entregadas aquí 🎨</p>`;
  } else {
    htmlContenido += entregadasStorage.map((item, index) => `
      <div class="commission-card">
        ${isAdminUnlocked ? `<button class="btn-delete-item" onclick="borrarEntregadaIndividual(${index})" title="Borrar esta publicación">×</button>` : ''}
        <img src="${item.imagen}" loading="lazy" alt="Comisión para ${item.cliente}" onclick="openModal('${item.imagen}')">
        <div class="commission-info">
          <div class="commission-user">👤 ${item.cliente}</div>
          <div class="commission-prompt">"${item.idea}"</div>
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = htmlContenido;
  setView(e || document.getElementById('btn-user-commissions'), container);
  
  if (isAdminUnlocked) {
    document.getElementById('adminBox').style.display = 'block';
  }
}

function publicarComisionAdmin() {
  const cliente = document.getElementById('adminClient').value.trim();
  const idea = document.getElementById('adminIdea').value.trim();
  let img = document.getElementById('adminImg').value.trim();

  if (!cliente || !idea || !img) {
    alert("Por favor rellena todos los campos (cliente, idea y ruta de imagen).");
    return;
  }

  if (!img.includes('/')) {
    img = 'ILUSTRACION/' + img;
  }

  const nuevaComision = { cliente, idea, imagen: img };

  let entregadasStorage = JSON.parse(localStorage.getItem('betto_entregadas')) || [];
  entregadasStorage.unshift(nuevaComision);
  localStorage.setItem('betto_entregadas', JSON.stringify(entregadasStorage));

  alert("¡Publicado con éxito en ENTREGADAS! 🎉");
  showUserCommissions();
}

function borrarEntregadaIndividual(index) {
  if (confirm("¿Seguro que deseas eliminar esta publicación?")) {
    let entregadasStorage = JSON.parse(localStorage.getItem('betto_entregadas')) || [];
    entregadasStorage.splice(index, 1);
    localStorage.setItem('betto_entregadas', JSON.stringify(entregadasStorage));
    showUserCommissions();
  }
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

(function init() {
  cambiarTema('SFW');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat && GALERIA[cat]) {
      btn.textContent = `${cat === 'NSFW' ? 'NSFW 🔞' : cat} (${GALERIA[cat].length})`;
    }
  });

  const totalPagesSFW = GALERIA.comicsSFW.reduce((a, b) => a + b.pages.length, 0);
  document.getElementById('btn-comics').textContent = `CÓMICS (${totalPagesSFW})`;
})();
