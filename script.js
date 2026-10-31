let nsfwUnlocked = false;
let currentComicType = 'SFW';

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

function sendOrder(e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value;
  const type = document.getElementById('orderType').value;
  const idea = document.getElementById('orderIdea').value;
  
  const fechaActual = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ticketId = 'TICKET #' + Math.floor(1000 + Math.random() * 9000);

  const nuevoPedido = { id: ticketId, cliente: name, tipo: type, idea: idea, fecha: fechaActual };

  let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];
  pedidosGuardados.unshift(nuevoPedido);
  localStorage.setItem('betto_tickets', JSON.stringify(pedidosGuardados));

  const mensaje = `🔔 *¡NUEVO PEDIDO / TICKET!*\n\n🎫 *ID:* ${ticketId}\n👤 *Cliente:* ${name}\n🎨 *Tipo:* ${type}\n💡 *Idea:* ${idea}`;
  const phone = "573152395773";
  
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank');

  alert(`¡Pedido registrado con éxito! Tu número de ticket asignado es ${ticketId} 🎉`);
  document.querySelector('.order-form').reset();
}

// 🔒 ACCESO DE ADMIN CON UN SOLO CLIC EN EL AVATAR
function pedirAccesoAdmin() {
  const password = prompt("🔒 ACCESO RESTRINGIDO\nIntroduce la contraseña de Administrador para ver los Tickets:");
  if (password === "BETTO2026") {
    const btnTickets = document.getElementById('btn-tickets');
    btnTickets.classList.remove('hidden');
    showTickets(btnTickets);
    alert("¡Acceso concedido, Betto! Panel de tickets desbloqueado.");
  } else if (password !== null) {
    alert("❌ Contraseña incorrecta.");
  }
}

function showTickets(e) {
  cambiarTema('SFW');
  const container = document.getElementById("ticketsContainer");
  let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];

  if (pedidosGuardados.length === 0) {
    container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--pink);">No hay tickets de pedidos pendientes en este momento 🎫</p>`;
  } else {
    container.innerHTML = `
      <div style="grid-column: 1/-1; display: flex; justify-content: flex-end;">
        <button class="btn-delete" onclick="borrarTodosLosTickets()">🗑️ Vaciar Todos los Tickets</button>
      </div>
    ` + pedidosGuardados.map((ticket, index) => `
      <div class="ticket-card" id="ticket-${index}">
        <div class="ticket-header">
          <span class="ticket-id">${ticket.id}</span>
          <span class="ticket-date">📅 ${ticket.fecha}</span>
        </div>
        <div class="ticket-client">👤 ${ticket.cliente}</div>
        <div class="ticket-type">🎨 ${ticket.tipo}</div>
        <div class="ticket-idea">"${ticket.idea}"</div>
        
        <div class="ticket-actions">
          <input type="text" id="img-url-${index}" placeholder="Ej: COMISIONES/nombre.png o 1.png" />
          <button class="btn-finish" onclick="finalizarTicket(${index})">✨ Finalizar y Publicar en Entregadas</button>
          <button class="btn-delete" onclick="borrarTicket(${index})">❌ Borrar Ticket</button>
        </div>
      </div>
    `).join('');
  }

  setView(e || document.getElementById('btn-tickets'), container);
}

function finalizarTicket(index) {
  let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];
  let imgInput = document.getElementById(`img-url-${index}`).value.trim();

  if (!imgInput) {
    alert("Por favor, ingresa la ruta o nombre de la imagen finalizada.");
    return;
  }

  if (!imgInput.includes('/')) {
    imgInput = 'ILUSTRACION/' + imgInput; 
  }

  const ticketACompletar = pedidosGuardados[index];

  const comisionEntregada = {
    cliente: ticketACompletar.cliente,
    idea: ticketACompletar.idea,
    imagen: imgInput
  };

  let entregadasGuardadas = JSON.parse(localStorage.getItem('betto_entregadas')) || [];
  entregadasGuardadas.unshift(comisionEntregada);
  localStorage.setItem('betto_entregadas', JSON.stringify(entregadasGuardadas));

  pedidosGuardados.splice(index, 1);
  localStorage.setItem('betto_tickets', JSON.stringify(pedidosGuardados));

  alert("¡Trabajo finalizado con éxito! Publicado en ENTREGADAS 🎨");
  showTickets();
}

function borrarTicket(index) {
  if (confirm("¿Estás seguro de eliminar este ticket?")) {
    let pedidosGuardados = JSON.parse(localStorage.getItem('betto_tickets')) || [];
    pedidosGuardados.splice(index, 1);
    localStorage.setItem('betto_tickets', JSON.stringify(pedidosGuardados));
    showTickets();
  }
}

function borrarTodosLosTickets() {
  if (confirm("¿Deseas eliminar todos los tickets registrados?")) {
    localStorage.removeItem('betto_tickets');
    showTickets();
  }
}

function showUserCommissions(e) {
  cambiarTema('SFW');
  const container = document.getElementById("userCommissionsGallery");

  const entregadasStorage = JSON.parse(localStorage.getItem('betto_entregadas')) || [];

  let htmlContenido = "";

  if (entregadasStorage.length > 0) {
    htmlContenido += `
      <div style="grid-column: 1/-1; display: flex; justify-content: flex-end;">
        <button class="btn-delete" onclick="borrarEntregadasAdmin()">🗑️ Borrar Todas las Entregadas (Admin)</button>
      </div>
    `;
  }

  if (entregadasStorage.length === 0) {
    htmlContenido += `<p style="text-align:center; grid-column: 1/-1; color: var(--pink);">Pronto se publicarán las primeras comisiones entregadas aquí 🎨</p>`;
  } else {
    htmlContenido += entregadasStorage.map((item, index) => `
      <div class="commission-card">
        <button class="btn-delete-item" onclick="borrarEntregadaIndividual(${index})" title="Borrar esta publicación">×</button>
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
}

function borrarEntregadaIndividual(index) {
  const password = prompt("⚠️ Zona restringida (Admin).\nIntroduce la contraseña para borrar esta publicación:");
  if (password === "BETTO2026") {
    let entregadasStorage = JSON.parse(localStorage.getItem('betto_entregadas')) || [];
    entregadasStorage.splice(index, 1);
    localStorage.setItem('betto_entregadas', JSON.stringify(entregadasStorage));
    showUserCommissions();
  } else if (password !== null) {
    alert("❌ Contraseña incorrecta.");
  }
}

function borrarEntregadasAdmin() {
  const password = prompt("⚠️ Zona restringida (Admin).\nIntroduce la contraseña para borrar todas las entregadas:");
  if (password === "BETTO2026") {
    localStorage.removeItem('betto_entregadas');
    alert("¡Todas las comisiones entregadas fueron borradas!");
    showUserCommissions();
  } else if (password !== null) {
    alert("❌ Contraseña incorrecta.");
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
