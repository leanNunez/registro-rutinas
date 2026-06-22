/* =============================================================
  preview-rutina.js — actualización en tiempo real de la tarjeta preview
  Escucha cambios en el formulario de rutina y en la lista de ejercicios
  para reflejar el estado actual en la columna de preview.
  No modifica crear-rutina.js: usa eventos nativos y MutationObserver.
============================================================= */

/* Referencias a los nodos de la preview */
const previewNombre      = document.getElementById("preview-nombre");
const previewDias        = document.getElementById("preview-dias");
const previewEjercicios  = document.getElementById("preview-ejercicios");
const previewDieta       = document.getElementById("preview-dieta");

/* -- Estado inicial: el nombre arranca vacío → estilo apagado ----------- */
previewNombre.classList.add("vacio-nombre");


/* -----------------------------------------------------------------------
  1. NOMBRE — se actualiza con cada tecla en el input
  "input" dispara en cada cambio de contenido, a diferencia de "change"
  que solo dispara al perder el foco.
----------------------------------------------------------------------- */
document.getElementById("rutina-nombre").addEventListener("input", (evento) => {
  const valor = evento.target.value.trim();

  if (valor) {
    /* Hay texto: mostramos el nombre con estilo normal */
    previewNombre.textContent = valor;
    previewNombre.classList.remove("vacio-nombre");
  } else {
    /* Campo vacío: volvemos al placeholder apagado */
    previewNombre.textContent = "Sin nombre";
    previewNombre.classList.add("vacio-nombre");
  }
});


/* -----------------------------------------------------------------------
  1b. NOMBRE DESDE SELECTOR — se actualiza al elegir una rutina existente
  Cuando el usuario cambia de rutina en el selector (o mostrarRutina lo
  dispara programáticamente), sincronizamos el nombre en la preview.
----------------------------------------------------------------------- */
document.getElementById("selector-rutina").addEventListener("change", (evento) => {
  const selector = evento.target;
  const texto = selector.options[selector.selectedIndex]?.text ?? "";

  if (texto) {
    previewNombre.textContent = texto;
    previewNombre.classList.remove("vacio-nombre");
  } else {
    previewNombre.textContent = "Sin nombre";
    previewNombre.classList.add("vacio-nombre");
  }
});


/* -----------------------------------------------------------------------
  2. DÍAS — se actualizan al tildar o destildar cada checkbox
  Recorremos todos los checkboxes de días y escuchamos "change" en cada uno.
----------------------------------------------------------------------- */
document.querySelectorAll("#formulario-rutina input[name='dia']").forEach(checkbox => {
  checkbox.addEventListener("change", actualizarPreviewDias);
});

function actualizarPreviewDias() {
  /* Vaciamos las pills actuales */
  previewDias.innerHTML = "";

  /* Por cada checkbox tildado creamos una pill en la preview */
  document.querySelectorAll("#formulario-rutina input[name='dia']:checked").forEach(check => {
    const pill = document.createElement("span");
    pill.className = "preview-dia";
    pill.textContent = check.value;
    previewDias.appendChild(pill);
  });
}


/* -----------------------------------------------------------------------
  3. EJERCICIOS — MutationObserver en #lista-ejercicios
  En vez de modificar mostrarEjercicios(), usamos un observer que detecta
  automáticamente cuando el JS agrega o borra nodos en esa lista.
  Así preview-rutina.js no depende de la implementación interna de crear-rutina.js.
----------------------------------------------------------------------- */
function actualizarPreviewEjercicios() {
  previewEjercicios.innerHTML = "";

  /* Traemos solo los <div> directos (los <button> de borrar los ignoramos) */
  const ejerciciosDivs = document.querySelectorAll("#lista-ejercicios > div");

  if (ejerciciosDivs.length === 0) {
    /* Sin ejercicios: mostramos el estado vacío */
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Sin ejercicios aún";
    previewEjercicios.appendChild(vacio);
    return;
  }

  /* Copiamos el texto de cada tarjeta de ejercicio a la preview */
  ejerciciosDivs.forEach(div => {
    const item = document.createElement("div");
    item.className = "preview-ejercicio";
    item.textContent = div.textContent;
    previewEjercicios.appendChild(item);
  });
}

/* Arrancamos el observer con debounce: espera 80ms después de la ÚLTIMA mutación
  antes de actualizar la preview. Así evitamos el flash del innerHTML = "" seguido
   de los appends — solo reaccionamos cuando el DOM terminó de cambiar. */
let timerEjercicios;
const observadorEjercicios = new MutationObserver(() => {
  clearTimeout(timerEjercicios);
  timerEjercicios = setTimeout(actualizarPreviewEjercicios, 80);
});
observadorEjercicios.observe(
  document.getElementById("lista-ejercicios"),
  { childList: true }
);


/* -----------------------------------------------------------------------
  4. DIETA — MutationObserver en #lista-dieta
  Mismo patrón que ejercicios: detecta cambios en la lista y sincroniza
  la sección de dieta en la preview sin tocar MostrarDieta().
----------------------------------------------------------------------- */
function actualizarPreviewDieta() {
  previewDieta.innerHTML = "";

  /* Traemos solo los <div> directos (ignoramos los <button> de borrar) */
  const dietaDivs = document.querySelectorAll("#lista-dieta > div");

  if (dietaDivs.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Sin dieta aún";
    previewDieta.appendChild(vacio);
    return;
  }

  /* Copiamos el texto de cada ítem de dieta a la preview */
  dietaDivs.forEach(div => {
    const item = document.createElement("div");
    item.className = "preview-dieta-item";
    item.textContent = div.textContent;
    previewDieta.appendChild(item);
  });
}

/* Mismo debounce para dieta */
let timerDieta;
const observadorDieta = new MutationObserver(() => {
  clearTimeout(timerDieta);
  timerDieta = setTimeout(actualizarPreviewDieta, 80);
});
observadorDieta.observe(
  document.getElementById("lista-dieta"),
  { childList: true }
);


