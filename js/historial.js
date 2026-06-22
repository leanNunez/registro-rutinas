/* ============================================================
    historial.js — Página de historial de entrenamientos.
    Mismas herramientas que crear-rutina.js: Axios + DOM vanilla.
   ============================================================ */

const URL_BASE = "http://localhost:3000";

/* ---------- PASO 0: estado global y referencias al DOM ----------
    personaElegida: id de la persona activa entre funciones.
    rutinasDisponibles: array con las rutinas de la persona activa,
    guardado en memoria para no hacer un GET extra al cambiar de rutina.
    Las referencias al DOM se capturan una sola vez para no repetir
    getElementById / querySelector en cada función.
*/
let personaElegida      = null;
let rutinasDisponibles  = [];

const formularioRegistro        = document.getElementById("formulario-registro");
const selectorPersona           = document.getElementById("selector-persona");
const selectorRutinaHistorial   = document.getElementById("selector-rutina-historial");
const listaHistorial            = document.getElementById("lista-historial");
const resumenDiv                = document.getElementById("resumen");
const formularioSugerencia      = document.getElementById("formulario-sugerencia");
const inputSugerencia           = document.getElementById("texto-sugerencia");

/* ---------- PASO 0B: modal de confirmación ----------
    Reemplaza el alert() nativo del navegador con un modal propio.
    mostrarModal(mensaje): inyecta el texto y activa la clase "activo".
    El botón Aceptar la cierra removiendo esa clase.
*/
function mostrarModal(mensaje) {
    const overlay = document.getElementById("modal-overlay");
    const texto   = document.getElementById("modal-mensaje");
    texto.textContent = mensaje;
    overlay.classList.add("activo");
}

document.getElementById("modal-boton-ok").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.remove("activo");
});


/* ---------- PASO 1: llenar el selector de personas ----------
    - GET /personas → crea un <option> por persona en #selector-persona.
    - Elige la primera por defecto y dispara en cadena:
        cargarRutinasParaHistorial → cargarHistorial → cargarSugerencia.
*/
async function cargarPersonas() {
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas`);
        const personas  = respuesta.data;

        selectorPersona.innerHTML = "";

        if (personas.length === 0) {
            console.log("No hay personas registradas.");
            return;
        }

        personas.forEach(persona => {
            const opcion       = document.createElement("option");
            opcion.value       = persona.id;
            opcion.textContent = persona.nombre;
            selectorPersona.appendChild(opcion);
        });

        personaElegida          = String(personas[0].id ?? "").trim();
        selectorPersona.value   = personaElegida;

        await cargarRutinasParaHistorial(personaElegida);
        await cargarHistorial();
        await cargarSugerencia(personaElegida);

    } catch (error) {
        console.error("Error al cargar personas:", error);
    }
}


/* ---------- PASO 2: cambio de persona ----------
    cargarRutinasParaHistorial: GET /rutinas → filtra por personaId y
    llena #selector-rutina-historial con las rutinas de la persona activa.
    Se filtra con String() para evitar problemas de tipo (1 vs "1").

    cargarSugerencia: GET /personas/:id → muestra la sugerencia guardada
    en el <textarea #texto-sugerencia>.

    El listener de #selector-persona actualiza personaElegida y llama
    a las dos funciones anteriores + recarga el historial.
*/
async function cargarRutinasParaHistorial(idPersona) {
    try {
        const respuesta        = await axios.get(`${URL_BASE}/rutinas`);
        const todasLasRutinas  = respuesta.data;

        const rutinas = todasLasRutinas.filter(
            r => String(r.personaId) === String(idPersona)
        );

        selectorRutinaHistorial.innerHTML = "";

        if (rutinas.length === 0) {
            selectorRutinaHistorial.innerHTML = "<option>Sin rutinas</option>";
            return;
        }

        rutinas.forEach(rutina => {
            const opcion       = document.createElement("option");
            opcion.value       = rutina.id;
            opcion.textContent = rutina.nombre;
            selectorRutinaHistorial.appendChild(opcion);
        });

        // Guarda las rutinas en memoria y muestra la primera en el preview
        rutinasDisponibles = rutinas;
        await cargarEjerciciosRutina(rutinas[0].id);
    } catch (error) {
        console.error("Error al cargar rutinas:", error);
    }
}

async function cargarSugerencia(idPersona) {
    try {
        const respuesta        = await axios.get(`${URL_BASE}/personas/${idPersona}`);
        const persona          = respuesta.data;
        inputSugerencia.value  = persona.sugerencia || "";
    } catch (error) {
        console.error("Error al cargar sugerencia:", error);
    }
}

selectorPersona.addEventListener("change", async () => {
    personaElegida = String(selectorPersona.value ?? "").trim();
    await cargarRutinasParaHistorial(personaElegida);
    await cargarHistorial();
    await cargarSugerencia(personaElegida);
    // El preview se actualiza dentro de cargarRutinasParaHistorial con la primera rutina
});

// Al cambiar de rutina en el selector, actualiza el preview con sus ejercicios
selectorRutinaHistorial.addEventListener("change", async () => {
    await cargarEjerciciosRutina(selectorRutinaHistorial.value);
});


/* ---------- PASO 2B: preview de la rutina seleccionada ----------
    cargarEjerciciosRutina: busca la rutina en rutinasDisponibles (sin
    request extra), luego GET /ejercicios?rutinaId=X y delega el dibujo
    a dibujarPreviewRutina.

    dibujarPreviewRutina: actualiza la tarjeta de la columna derecha con:
      · Nombre de la rutina en #preview-rutina-nombre
      · Un pill por cada día en #preview-rutina-dias
      · Un ítem por ejercicio en #preview-rutina-ejercicios
        mostrando nombre, series × reps y descanso.
*/
async function cargarEjerciciosRutina(rutinaId) {
    const rutina = rutinasDisponibles.find(r => String(r.id) === String(rutinaId));
    if (!rutina) return;

    try {
        const respuesta  = await axios.get(`${URL_BASE}/ejercicios?rutinaId=${rutinaId}`);
        const ejercicios = respuesta.data;
        dibujarPreviewRutina(rutina, ejercicios);
    } catch (error) {
        console.error("Error al cargar ejercicios de la rutina:", error);
    }
}

function dibujarPreviewRutina(rutina, ejercicios) {
    const nombre     = document.getElementById("preview-rutina-nombre");
    const diasDiv    = document.getElementById("preview-rutina-dias");
    const ejercDiv   = document.getElementById("preview-rutina-ejercicios");

    // Nombre
    nombre.textContent = rutina.nombre || "Sin nombre";
    nombre.classList.toggle("vacio-nombre", !rutina.nombre);

    // Pills de días
    diasDiv.innerHTML = "";
    (rutina.dias || []).forEach(dia => {
        const pill       = document.createElement("span");
        pill.className   = "preview-dia";
        pill.textContent = dia;
        diasDiv.appendChild(pill);
    });

    // Lista de ejercicios
    ejercDiv.innerHTML = "";
    if (ejercicios.length === 0) {
        ejercDiv.innerHTML = '<p class="vacio">Sin ejercicios aún</p>';
        return;
    }

    ejercicios.forEach(ej => {
        const item       = document.createElement("div");
        item.className   = "preview-ejercicio";
        item.innerHTML   = `
            <strong>${ej.nombre}</strong>
            <span>${ej.series} series × ${ej.repeticiones} reps · ${ej.descanso}</span>
        `;
        ejercDiv.appendChild(item);
    });
}


/* ---------- PASO 3: mostrar historial y resumen ----------
    cargarHistorial: GET /historial → normaliza todos los campos a String
    para evitar inconsistencias de tipo, filtra por personaElegida y
    ordena del registro más nuevo al más viejo (por id descendente).
    Delega el pintado a dibujarLista y calcularResumen.

    dibujarLista: vacía #lista-historial y crea una tarjeta por registro
    con ejercicio, fecha, peso, reps, dificultad y botón Borrar.

    calcularResumen: en #resumen muestra cuatro métricas calculadas:
        · Progreso de carga por ejercicio (primer peso → último peso).
        · Última rutina registrada.
        · Ejercicios con dificultad "alta".
        · Sugerencia del entrenador (llega como parámetro desde PASO 5).
*/
async function cargarHistorial(sugerencia = "") {
    if (!personaElegida) return;

    try {
        const respuesta  = await axios.get(`${URL_BASE}/historial`);
        const registros  = (respuesta.data || [])
            .map(registro => ({
                ...registro,
                personaId:   String(registro.personaId   ?? "").trim(),
                rutinaId:    String(registro.rutinaId    ?? "").trim(),
                ejercicio:   String(registro.ejercicio   ?? "").trim(),
                fecha:       String(registro.fecha       ?? "").trim() || "Sin fecha",
                dificultad:  String(registro.dificultad  ?? "").trim() || "sin definir"
            }))
            .filter(r => r.personaId === String(personaElegida))
            .filter(r => r.ejercicio.length > 0)
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

        dibujarLista(registros);
        calcularResumen(registros, sugerencia);
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

function dibujarLista(registros) {
    listaHistorial.innerHTML = "";

    if (registros.length === 0) {
        listaHistorial.innerHTML = "<p>No hay registros para esta persona todavía.</p>";
        return;
    }

    registros.forEach(reg => {
        const tarjeta       = document.createElement("div");
        tarjeta.className   = "bloque tarjeta";
        tarjeta.innerHTML   = `
            <p><strong>${reg.ejercicio}</strong></p>
            <p>Fecha: ${reg.fecha}</p>
            <p>Peso: ${reg.peso}kg | Reps: ${reg.repeticiones} | Dificultad: ${reg.dificultad}</p>
            <button type="button" class="btn-borrar" data-id="${reg.id}">Borrar</button>
        `;
        listaHistorial.appendChild(tarjeta);
    });
}

function calcularResumen(registros, sugerencia) {
    if (!resumenDiv) return;

    const total            = registros.length;
    const ejerciciosUnicos = [...new Set(registros.map(r => r.ejercicio))];

    const progreso = ejerciciosUnicos.map(ejercicio => {
        const items   = registros.filter(r => r.ejercicio === ejercicio);
        const primero = items[items.length - 1];
        const ultimo  = items[0];
        if (!primero || !ultimo) return null;
        return `• ${ejercicio}: ${primero.peso}kg → ${ultimo.peso}kg`;
    }).filter(Boolean).join("<br>");

    const ultimoRegistro    = registros[0];
    const ultimaRutina      = ultimoRegistro ? `Rutina ${ultimoRegistro.rutinaId}` : "Sin registros";
    const ejerciciosDific   = registros
        .filter(r => String(r.dificultad).toLowerCase() === "alta")
        .map(r => r.ejercicio)
        .join(", ");

    resumenDiv.innerHTML = `
        <p><strong>Total de registros:</strong> ${total}</p>
        <p><strong>Progreso de carga:</strong><br>${progreso || "Sin datos"}</p>
        <p><strong>Último cambio de rutina:</strong> ${ultimaRutina}</p>
        <p><strong>Ejercicios que cuestan:</strong> ${ejerciciosDific || "Ninguno"}</p>
        <p><strong>Próximo cambio sugerido:</strong> ${sugerencia || "Sin sugerencias por ahora"}</p>
    `;
}


/* ---------- PASO 4: registrar un entrenamiento ----------
    Submit de #formulario-registro: recoge todos los campos del formulario,
    genera la fecha de hoy automáticamente con toISOString y hace POST
    /historial. Luego limpia el formulario y recarga el historial.
*/
formularioRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoRegistro = {
        personaId:    selectorPersona.value,
        rutinaId:     Number(selectorRutinaHistorial.value),
        ejercicio:    document.getElementById("registro-ejercicio").value,
        peso:         document.getElementById("registro-peso").value,
        repeticiones: document.getElementById("registro-repeticiones").value,
        dificultad:   document.getElementById("registro-dificultad").value,
        fecha:        new Date().toISOString().slice(0, 10)
    };

    try {
        await axios.post(`${URL_BASE}/historial`, nuevoRegistro);
        formularioRegistro.reset();
        await cargarHistorial();
    } catch (error) {
        console.error("Error al registrar:", error);
    }
});


/* ---------- PASO 5: guardar sugerencia del entrenador ----------
    Submit de #formulario-sugerencia: PATCH /personas/:id con el texto
    del textarea. Muestra el modal de confirmación y recarga el historial
    pasándole la sugerencia para que aparezca en el resumen al instante.
    */
formularioSugerencia.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textoSugerencia = inputSugerencia.value;

    try {
        await axios.patch(`${URL_BASE}/personas/${personaElegida}`, {
            sugerencia: textoSugerencia
        });

        mostrarModal("¡Sugerencia guardada con éxito!");
        await cargarSugerencia(personaElegida);
        await cargarHistorial(textoSugerencia);

    } catch (error) {
        console.error("Error al guardar la sugerencia:", error);
    }
});


/* ---------- PASO 6: borrar un registro ----------
    Click delegation en #lista-historial: detecta el botón Borrar por
    data-id, hace DELETE /historial/:id y recarga la lista.
    Usar delegation evita agregar N listeners, uno por cada tarjeta.
*/
listaHistorial.addEventListener("click", async (e) => {
    if (e.target.tagName !== "BUTTON" || !e.target.dataset.id) return;

    const idRegistro = e.target.dataset.id;
    try {
        await axios.delete(`${URL_BASE}/historial/${idRegistro}`);
        await cargarHistorial();
    } catch (error) {
        console.error("Error al borrar:", error);
    }
});


/* ---------- ARRANQUE ----------
    iniciar() llama a cargarPersonas(), que al terminar dispara el resto
    en cadena. Es el único punto de entrada del módulo.
*/
async function iniciar() {
    await cargarPersonas();
}

iniciar();
