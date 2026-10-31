let nsfwUnlocked = false;
let currentComicType = 'SFW';

const EXTENSIONES = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'];

// Probar cuál extensión existe y aplicarla al CSS (--bg-portada) o a una etiqueta <img>
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

// CAMBIA ENTRE SFW Y NSFW (Soporta JPG, PNG, WEBP en avatar y portada)
function cambiarTema(modo) {
  const root = document.documentElement;
  const avatar = document.getElementById('avatar-img');
  const esNSFW = modo === 'NSFW';

  const basePortada = esNSFW ? 'portada_nsfw' : 'portada';
  const baseAvatar = esNSFW ? 'avatar_nsfw' : 'avatar';

  // Actualiza la variable CSS de la portada en el header
  probarYAplicarImagen(basePortada, (rutaCorrecta) => {
    root.style.setProperty('--bg-portada', `url('${rutaCorrecta}')`);
  });

  // Actualiza la imagen del avatar
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
    document.getElementById("userCommissionsGallery"),
    document.getElementById("ticketsContainer")
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

// GUARDAR COMO TICKET EN LOCALSTORAGE Y ENVIAR NOTIFICACIÓN CON ID A WHATSAPP
function sendOrder(e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value;
  const type = document.getElementById('orderType').value;
  const idea = document.getElementById('orderIdea').value;
  
  const fechaActual = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ticketId = 'TICKET #' + Math.floor(1000 + Math.random() * 9000);

  // Crear objeto del ticket
  const nuevoPedido = { id: ticketId, cliente: name, tipo: type, idea: idea, fecha: fechaActual };

  // Guardar en el almacenamiento del navegador (localStorage)
  let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];
  pedidosGuardados.unshift(nuevoPedido); // Pone el más reciente arriba
  localStorage.setItem('betto_tickets', JSON.stringify(pedidosGuardados));

  // Notificación a WhatsApp incluyendo explícitamente el número de Ticket
  const text = `🔔 *¡NUEVO PEDIDO / TICKET!*%0A%0A🎫 *ID:* ${ticketId}%0A👤 *Cliente:* ${encodeURIComponent(name)}%0A🎨 *Tipo:* ${encodeURIComponent(type)}%0A💡 *Idea:* ${encodeURIComponent(idea)}`;
  const phone = "573152395773";
  
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');

  alert(`¡Pedido registrado con éxito! Tu número de ticket es ${ticketId} 🎉`);
  document.querySelector('.order-form').reset();
  showTickets();
}

// MOSTRAR LA PESTAÑA DE TICKETS ALMACENADOS
function showTickets(e) {
  cambiarTema('SFW');
  const container = document.getElementById("ticketsContainer");
  let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];

  if (pedidosGuardados.length === 0) {
    container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--pink);">No hay tickets de pedidos pendientes en este momento 🎫</p>`;
  } else {
    container.innerHTML = pedidosGuardados.map(ticket => `
      <div class="ticket-card">
        <div class="ticket-header">
          <span class="ticket-id">${ticket.id}</span>
          <span class="ticket-date">📅 ${ticket.fecha}</span>
        </div>
        <div class="ticket-client">👤 ${ticket.cliente}</div>
        <div class="ticket-type">🎨 ${ticket.tipo}</div>
        <div class="ticket-idea">"${ticket.idea}"</div>
      </div>
    `).join('');
  }

  setView(e || document.getElementById('btn-tickets'), container);
}

// MOSTRAR GALERÍA DE COMISIONES COMPLETADAS DE USUARIOS
function showUserCommissions(e) {
  cambiarTema('SFW');
  const container = document.getElementById("userCommissionsGallery");

  if (!GALERIA.comisionesUsuarios || !GALERIA.comisionesUsuarios.length) {
    container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--pink);">Pronto se publicarán las primeras comisiones entregadas aquí 🎨</p>`;
  } else {
    container.innerHTML = GALERIA.comisionesUsuarios.map(item => `
      <div class="commission-card">
        <img src="${item.imagen}" loading="lazy" alt="Comisión para ${item.cliente}" onclick="openModal('${item.imagen}')">
        <div class="commission-info">
          <div class="commission-user">👤 ${item.cliente}</div>
          <div class="commission-prompt">"${item.idea}"</div>
        </div>
      </div>
    `).join('');
  }

  setView(e || document.getElementById('btn-user-commissions'), container);
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
