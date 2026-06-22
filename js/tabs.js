/* =============================================================
  tabs.js — lógica de navegación por tabs
  Reutilizable en cualquier página que tenga:
    - Botones con clase .tabs__btn y atributo data-tab="<id>"
    - Paneles con clase .tabs__panel e id="tab-<id>"
  El primer botón/panel con clase "activo" en el HTML define
  cuál se muestra al cargar.
============================================================= */

/* Un solo listener en el nav (delegación de eventos) maneja todos los botones.
  Al hacer click en un botón:
    1. Le quitamos tabs__btn--activo a todos y se lo damos al clickeado.
    2. Ocultamos todos los paneles y mostramos el que corresponde al data-tab. */
document.querySelector(".tabs__nav").addEventListener("click", (evento) => {
  // Buscamos el botón más cercano al elemento clickeado
  const boton = evento.target.closest(".tabs__btn");
  if (!boton) return; // click fuera de un botón → ignorar

  const tab = boton.dataset.tab; // ej: "rutinas" → busca #tab-rutinas

  // Actualizamos qué botón está activo
  document.querySelectorAll(".tabs__btn").forEach(b => b.classList.remove("tabs__btn--activo"));
  boton.classList.add("tabs__btn--activo");

  // Mostramos el panel correspondiente y ocultamos los demás
  document.querySelectorAll(".tabs__panel").forEach(p => p.classList.remove("activo"));
  document.getElementById("tab-" + tab).classList.add("activo");
});
