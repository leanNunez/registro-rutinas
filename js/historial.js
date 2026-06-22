const URL_BASE = "http://localhost:3000";

// Variables globales para mantener el estado
let personaElegida = null;

// Referencias al DOM (Asegúrate de que estos IDs existan en tu historial.html)

const formularioRegistro = document.getElementById("formulario-registro");
const selectorPersona = document.getElementById("selector-persona");
const selectorRutinaHistorial = document.getElementById("selector-rutina-historial");
const listaHistorial = document.getElementById("lista-historial");
const resumenDiv = document.getElementById("resumen");
const formularioSugerencia = document.getElementById("formulario-sugerencia");
const inputSugerencia = document.getElementById("texto-sugerencia");


// Funcion para mostrar el alert personalizado
function mostrarModal(mensaje) {
    const overlay = document.getElementById("modal-overlay");
    const texto = document.getElementById("modal-mensaje");
    texto.textContent = mensaje;
    overlay.classList.add("activo");
}

document.getElementById("modal-boton-ok").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.remove("activo");
});


/* ---------- PASO 1: llenar el selector de personas ----------
   Igual que en crear-rutina.js: axios.get(".../personas"), recorrer y crear <option>.
   Al final, elegir la primera y cargar su historial (PASO 3).
*/
async function cargarPersonas() {
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas`);
        const personas = respuesta.data;

        selectorPersona.innerHTML = "";

        if (personas.length === 0) {
            console.log("No hay personas registradas.");
            return;
        }

        personas.forEach(persona => {
            const opcion = document.createElement("option");
            opcion.value = persona.id;
            opcion.textContent = persona.nombre;
            selectorPersona.appendChild(opcion);
        });

        // Selecciona la primera persona por defecto y carga sus datos
        personaElegida = String(personas[0].id ?? "").trim();
        selectorPersona.value = personaElegida;

        await cargarRutinasParaHistorial(personaElegida);
        await cargarHistorial();
        await cargarSugerencia(personaElegida);

    } catch (error) {
        console.error("Error al cargar personas:", error);
    }
}

/* ---------- PASO 2: al cambiar de persona ----------
   - Guardá personaElegida.
   - Traé la persona (axios.get ".../personas/" + id) y poné su .sugerencia
     dentro del <textarea id="texto-sugerencia"> (.value = ...).
   - Traé sus rutinas (axios.get ".../rutinas?personaId=" + personaElegida) y
     llenás el <select id="selector-rutina-historial"> con un <option> por rutina
     (igual que se hace con #selector-rutina en crear-rutina.js).
   - Cargá el historial (PASO 3).
*/
async function cargarRutinasParaHistorial(idPersona) {
    try {
        // Obtenemos todas las rutinas
        const respuesta = await axios.get(`${URL_BASE}/rutinas`);
        const todasLasRutinas = respuesta.data;

        // Filtramos usando String() para comparar texto con texto
        const rutinas = todasLasRutinas.filter(r => String(r.personaId) === String(idPersona));

        selectorRutinaHistorial.innerHTML = "";

        if (rutinas.length === 0) {
            selectorRutinaHistorial.innerHTML = '<option>Sin rutinas</option>';
            return;
        }

        rutinas.forEach(rutina => {
            const opcion = document.createElement("option");
            opcion.value = rutina.id;
            opcion.textContent = rutina.nombre;
            selectorRutinaHistorial.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al cargar rutinas:", error);
    }
}

async function cargarSugerencia(idPersona) {
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas/${idPersona}`);
        const persona = respuesta.data;
        // Asignamos la sugerencia actual al textarea
        inputSugerencia.value = persona.sugerencia || "";
    } catch (error) {
        console.error("Error al cargar sugerencia:", error);
    }
}

// Al cambiar de persona, se actualizan rutinas, historial y sugerencia
selectorPersona.addEventListener("change", async () => {
    personaElegida = String(selectorPersona.value ?? "").trim();
    await cargarRutinasParaHistorial(personaElegida);
    await cargarHistorial();
    await cargarSugerencia(personaElegida);
});

/* ---------- PASO 3: mostrar el historial + el resumen ----------
   - Traé los registros con axios.get(".../historial?personaId=" + personaElegida).
   - LISTA: vaciá #lista-historial y, recorriendo, creá una tarjeta por registro
     (fecha, ejercicio, peso, repeticiones, dificultad) + botón Borrar.
     Consejo: ordenalos del más nuevo al más viejo antes de dibujar.
   - RESUMEN: en #resumen mostrá 3 cosas calculadas con los registros:
       a) Progreso de carga: por cada ejercicio, peso del primer registro vs del último.
       b) Último cambio de rutina: buscá el último registro donde cambia rutinaId.
       c) Ejercicios que cuestan: los que tienen dificultad "alta".
     (son funciones simples: agrupar/ordenar/restar/filtrar)
*/
async function cargarHistorial(sugerencia = "") {
    if (!personaElegida) return;

    try {
        const respuesta = await axios.get(`${URL_BASE}/historial`);
        const registros = (respuesta.data || [])
            .map(registro => ({
                ...registro,
                personaId: String(registro.personaId ?? "").trim(),
                rutinaId: String(registro.rutinaId ?? "").trim(),
                ejercicio: String(registro.ejercicio ?? "").trim(),
                fecha: String(registro.fecha ?? "").trim() || "Sin fecha",
                dificultad: String(registro.dificultad ?? "").trim() || "sin definir"
            }))
            .filter(registro => registro.personaId === String(personaElegida))
            .filter(registro => registro.ejercicio.length > 0)
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

        dibujarLista(registros);
        calcularResumen(registros, sugerencia);
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}

// --- FUNCIONES DE DIBUJO ---
function dibujarLista(registros) {
    const lista = document.getElementById("lista-historial");
    lista.innerHTML = "";

    if (registros.length === 0) {
        lista.innerHTML = "<p>No hay registros para esta persona todavía.</p>";
        return;
    }

    registros.forEach(reg => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "bloque tarjeta";
        tarjeta.innerHTML = `
            <p><strong>${reg.ejercicio}</strong></p>
            <p>Fecha: ${reg.fecha}</p>
            <p>Peso: ${reg.peso}kg | Reps: ${reg.repeticiones} | Dificultad: ${reg.dificultad}</p>
            <button type="button" class="btn-borrar" data-id="${reg.id}">Borrar</button>
        `;
        lista.appendChild(tarjeta);
    });
}

function calcularResumen(registros, sugerencia) {
    if (!resumenDiv) return;

    const total = registros.length;
    const ejerciciosUnicos = [...new Set(registros.map(reg => reg.ejercicio))];

    const progreso = ejerciciosUnicos.map(ejercicio => {
        const items = registros.filter(reg => reg.ejercicio === ejercicio);
        const primero = items[items.length - 1];
        const ultimo = items[0];

        if (!primero || !ultimo) return null;

        return `• ${ejercicio}: ${primero.peso}kg → ${ultimo.peso}kg`;
    }).filter(Boolean).join("<br>");

    const ultimoRegistro = registros[0];
    const ultimoCambioRutina = ultimoRegistro ? `Rutina ${ultimoRegistro.rutinaId}` : "Sin registros";
    const ejerciciosDificiles = registros
        .filter(reg => String(reg.dificultad).toLowerCase() === "alta")
        .map(reg => reg.ejercicio)
        .join(", ");

    resumenDiv.innerHTML = `
        <p><strong>Total de registros:</strong> ${total}</p>
        <p><strong>Progreso de carga:</strong><br>${progreso || "Sin datos"}</p>
        <p><strong>Último cambio de rutina:</strong> ${ultimoCambioRutina}</p>
        <p><strong>Ejercicios que cuestan:</strong> ${ejerciciosDificiles || "Ninguno"}</p>
        <p><strong>Próximo cambio sugerido:</strong> ${sugerencia || "Sin sugerencias por ahora"}</p>
    `;
}

/* ---------- PASO 4: registrar un entrenamiento ----------
   - Escuchá el "submit" del #formulario-registro, con evento.preventDefault().
   - La fecha se pone sola:  new Date().toISOString().slice(0, 10)  -> "AAAA-MM-DD".
   - Leé rutinaId del <select id="selector-rutina-historial"> (.value, convertilo con Number).
   - Leé ejercicio, peso (Number), repeticiones (Number) y dificultad.
   - axios.post(".../historial", { personaId, rutinaId, fecha, ejercicio, peso, repeticiones, dificultad }).
   - Limpiá el formulario y volvé a cargar el historial (PASO 3).
*/
formularioRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoRegistro = {
        personaId: selectorPersona.value,
        rutinaId: Number(selectorRutinaHistorial.value),
        ejercicio: document.getElementById("registro-ejercicio").value,
        peso: document.getElementById("registro-peso").value,
        repeticiones: document.getElementById("registro-repeticiones").value,
        dificultad: document.getElementById("registro-dificultad").value,
        fecha: new Date().toISOString().slice(0, 10)
    };

    try {
        await axios.post(`${URL_BASE}/historial`, nuevoRegistro);
        formularioRegistro.reset();
        await cargarHistorial();
    } catch (error) {
        console.error("Error al registrar:", error);
    }
});

/* ---------- PASO 5: guardar la sugerencia ----------
   - Escuchá el "click" del botón #btn-guardar-sugerencia.
   - Leé el texto del <textarea> y guardalo en la persona:
       axios.patch(".../personas/" + personaElegida, { sugerencia: texto }).
   - Recargá la sugerencia y el resumen para reflejar el cambio.
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
   - axios.delete(".../historial/" + id) y después recargar (PASO 3).
*/
listaHistorial.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
        const idRegistro = e.target.dataset.id;
        try {
            await axios.delete(`${URL_BASE}/historial/${idRegistro}`);
            await cargarHistorial();
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    }
});

// --- ARRANQUE (Lo que enciende el motor) ---
async function iniciar() {
    await cargarPersonas();
}

iniciar();