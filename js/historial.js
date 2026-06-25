/* ============================================================
    historial.js — Pantalla de entrenamiento activo.
    Muestra la rutina de la persona con días, grupos musculares
    y ejercicios. Al hacer clic en un ejercicio aparece un input
    para registrar el peso de hoy. La preview de la derecha
    se actualiza automáticamente con el último peso guardado.
   ============================================================ */

const URL_BASE = "http://localhost:3000";

/* ---------- PASO 0: estado global y referencias al DOM ----------
    personaElegida:     id de la persona activa entre funciones.
    rutinasDisponibles: rutinas de la persona activa en memoria (sin GET extra).
    historialActual:    registros del historial activo en memoria, para que
                        dibujarPreviewRutina pueda mostrar el último peso de
                        cada ejercicio sin un GET adicional.
*/
let personaElegida      = null;
let rutinasDisponibles  = [];
let historialActual     = [];

const selectorPersona           = document.getElementById("selector-persona");
const selectorRutinaHistorial   = document.getElementById("selector-rutina-historial");
const listaRutinaEjercicios     = document.getElementById("lista-rutina-ejercicios");
const formularioSugerencia      = document.getElementById("formulario-sugerencia");
const inputSugerencia           = document.getElementById("texto-sugerencia");
const formularioDificultades    = document.getElementById("formulario-dificultades");
const inputDificultades         = document.getElementById("texto-dificultades");

/* ---------- PASO 0B: toast de confirmación ----------
    Muestra un mensaje breve en la esquina inferior derecha y lo oculta
    automáticamente después de 2.5 segundos.
*/
function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2500);
}


/* ---------- PASO 1: llenar el selector de personas ----------
    - GET /personas → crea un <option> por persona en #selector-persona.
    - Elige la primera por defecto y dispara en cadena:
        cargarRutinasParaHistorial → cargarHistorial → cargarNotasPersona.
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

        // cargarHistorial primero para que historialActual esté listo
        // cuando dibujarPreviewRutina se ejecute dentro de cargarRutinasParaHistorial
        await cargarHistorial();
        await cargarRutinasParaHistorial(personaElegida);
        await cargarNotasPersona(personaElegida);

    } catch (error) {
        console.error("Error al cargar personas:", error);
    }
}


/* ---------- PASO 2: cambio de persona ----------
    cargarRutinasParaHistorial: GET /rutinas → filtra por personaId y
    llena #selector-rutina-historial con las rutinas de la persona activa.
    Después de cargar, dibuja la lista interactiva y la preview con la primera rutina.

    cargarNotasPersona: GET /personas/:id → muestra la sugerencia guardada
    en los textareas de la columna izquierda.
*/
async function cargarRutinasParaHistorial(idPersona) {
    try {
        const respuesta        = await axios.get(`${URL_BASE}/rutinas`);
        const todasLasRutinas  = respuesta.data;

        const rutinas = todasLasRutinas.filter(
            r => String(r.personaId) === String(idPersona)
        );

        selectorRutinaHistorial.innerHTML = "";
        rutinasDisponibles = [];

        if (rutinas.length === 0) {
            selectorRutinaHistorial.innerHTML = "<option>Sin rutinas</option>";
            listaRutinaEjercicios.innerHTML   = "<p>Esta persona no tiene rutinas aún.</p>";
            dibujarPreviewRutina({ nombre: "", dias: [] }, [], []);
            dibujarProgresoEjercicios([]);
            return;
        }

        rutinas.forEach(rutina => {
            const opcion       = document.createElement("option");
            opcion.value       = rutina.id;
            opcion.textContent = rutina.nombre;
            selectorRutinaHistorial.appendChild(opcion);
        });

        rutinasDisponibles = rutinas;

        // cargamos la primera rutina: preview + lista interactiva
        await cargarEjerciciosRutina(rutinas[0].id);

    } catch (error) {
        console.error("Error al cargar rutinas:", error);
    }
}

async function cargarNotasPersona(idPersona) {
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas/${idPersona}`); // traemos la persona completa para leer sus notas
        const persona   = respuesta.data;
        inputSugerencia.value   = persona.sugerencia   || ""; // pre-llenamos el textarea (o vacío si no hay nada guardado)
        inputDificultades.value = persona.dificultades || ""; // ídem para dificultades
        mostrarNotasEnPreview(persona.sugerencia, persona.dificultades); // actualizamos la preview de la derecha
    } catch (error) {
        console.error("Error al cargar notas de la persona:", error);
    }
}

/* Muestra la sugerencia y las dificultades en la tarjeta preview.
   Si el campo está vacío, oculta el bloque con hidden para no dejar espacio vacío. */
function mostrarNotasEnPreview(sugerencia, dificultades) {
    const divSug  = document.getElementById("preview-sugerencia");
    const divDif  = document.getElementById("preview-dificultades");

    if (sugerencia && sugerencia.trim()) {
        divSug.innerHTML = `<span class="preview-nota__label">Próximos cambios</span>${sugerencia.trim()}`;
        divSug.removeAttribute("hidden");
    } else {
        divSug.setAttribute("hidden", "");
    }

    if (dificultades && dificultades.trim()) {
        divDif.innerHTML = `<span class="preview-nota__label">Ejercicios que cuestan</span>${dificultades.trim()}`;
        divDif.removeAttribute("hidden");
    } else {
        divDif.setAttribute("hidden", "");
    }
}

selectorPersona.addEventListener("change", async () => {
    personaElegida = String(selectorPersona.value ?? "").trim();
    // historial primero: dibujarProgresoEjercicios necesita historialActual actualizado
    await cargarHistorial();
    await cargarRutinasParaHistorial(personaElegida);
    await cargarNotasPersona(personaElegida);
});

// Al cambiar de rutina: recarga lista interactiva y preview
selectorRutinaHistorial.addEventListener("change", async () => {
    await cargarEjerciciosRutina(selectorRutinaHistorial.value);
});


/* ---------- PASO 2B: cargar ejercicios y títulos de la rutina ----------
    Trae ejercicios y títulos de día en paralelo con Promise.all.
    Con esos datos dibuja tanto la lista interactiva como la preview.
*/
async function cargarEjerciciosRutina(rutinaId) {
    const rutina = rutinasDisponibles.find(r => String(r.id) === String(rutinaId));
    if (!rutina) return;

    try {
        const [respEjercicios, respTitulos] = await Promise.all([
            axios.get(`${URL_BASE}/ejercicios?rutinaId=${rutinaId}`),
            axios.get(`${URL_BASE}/diasTitulos?rutinaId=${rutinaId}`)
        ]);

        const ejercicios  = respEjercicios.data;
        const diasTitulos = respTitulos.data;

        dibujarPreviewRutina(rutina, ejercicios, diasTitulos);
        dibujarRutinaInteractiva(ejercicios, diasTitulos);
        dibujarProgresoEjercicios(ejercicios);

    } catch (error) {
        console.error("Error al cargar ejercicios de la rutina:", error);
    }
}


/* ---------- PASO 3: lista interactiva de ejercicios ----------
    Dibuja en #lista-rutina-ejercicios la estructura:
        Día (acordeón clickeable)
        → Grupo muscular (etiqueta naranja)
        → Ejercicio (click para abrir input de peso)
        → Form inline: input kg + botón Guardar

    El primer día arranca abierto. Los demás comienzan cerrados.
    Al hacer clic en el header de un día se alterna abierto/cerrado.
    Al hacer clic en un ejercicio se alterna el form inline visible/oculto.
*/
function dibujarRutinaInteractiva(ejercicios, diasTitulos) {
    listaRutinaEjercicios.innerHTML = "";

    if (ejercicios.length === 0) {
        listaRutinaEjercicios.innerHTML = "<p>Esta rutina no tiene ejercicios aún.</p>";
        return;
    }

    // mapa dia → titulo (ej: "Lunes" → "Pecho y Tríceps")
    const mapaTitulos = {};
    (diasTitulos || []).forEach(t => { mapaTitulos[t.dia] = t.titulo; });

    // agrupamos ejercicios por día: { "Lunes": [ej1, ej2], ... }
    const porDia = {};
    ejercicios.forEach(ej => {
        const dia = ej.dia || "Sin día";
        if (!porDia[dia]) porDia[dia] = [];
        porDia[dia].push(ej);
    });

    let esPrimerDia = true;

    Object.keys(porDia).forEach(dia => {
        const tituloCompleto = mapaTitulos[dia] ? `${dia} — ${mapaTitulos[dia]}` : dia;

        // --- acordeón del día ---
        const acordeon  = document.createElement("div");
        acordeon.className = "dia-acordeon";

        const header = document.createElement("div");
        header.className   = "dia-acordeon__header";
        header.textContent = tituloCompleto;

        const body = document.createElement("div");
        // el primer día arranca abierto
        body.className = esPrimerDia ? "dia-acordeon__body abierto" : "dia-acordeon__body";
        esPrimerDia = false;

        // click en el header → toggle abierto/cerrado
        header.addEventListener("click", () => {
            body.classList.toggle("abierto");
        });

        // agrupamos ejercicios de este día por grupo muscular
        const porGrupo = {};
        porDia[dia].forEach(ej => {
            const grupo = ej.grupoMuscular || "Sin grupo";
            if (!porGrupo[grupo]) porGrupo[grupo] = [];
            porGrupo[grupo].push(ej);
        });

        // por cada grupo muscular dibujamos su bloque
        Object.keys(porGrupo).forEach(grupo => {
            const divGrupo = document.createElement("div");
            divGrupo.className = "grupo-muscular";

            const tituloGrupo = document.createElement("div");
            tituloGrupo.className   = "grupo-muscular__titulo";
            tituloGrupo.textContent = grupo;
            divGrupo.appendChild(tituloGrupo);

            // por cada ejercicio: info clickeable + form inline oculto
            porGrupo[grupo].forEach(ej => {
                const item = document.createElement("div");
                item.className = "ejercicio-item";

                // info del ejercicio (click para mostrar el form)
                const info = document.createElement("div");
                info.className   = "ejercicio-item__info";
                info.innerHTML   = `
                    <span class="ejercicio-item__nombre">${ej.nombre}</span>
                    <span class="ejercicio-item__detalle">${ej.series} series × ${ej.repeticiones} reps · ${ej.descanso}</span>
                `;

                // form inline para registrar el peso (oculto por defecto)
                const form = document.createElement("form");
                form.className = "ejercicio-item__form";

                const inputPeso = document.createElement("input");
                inputPeso.type        = "number";
                inputPeso.placeholder = "kg de hoy";
                inputPeso.min         = "0";
                inputPeso.step        = "0.5";

                const btnGuardar = document.createElement("button");
                btnGuardar.type        = "submit";
                btnGuardar.textContent = "Guardar";

                form.appendChild(inputPeso);
                form.appendChild(btnGuardar);

                // click en la info → toggle del form inline
                info.addEventListener("click", () => {
                    item.classList.toggle("activo");
                    if (item.classList.contains("activo")) {
                        inputPeso.focus();
                    }
                });

                // submit del form → registra el peso y cierra el form
                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const peso = inputPeso.value.trim();
                    if (!peso) return;
                    await registrarPeso(ej, peso, item);
                });

                item.appendChild(info);
                item.appendChild(form);
                divGrupo.appendChild(item);
            });

            body.appendChild(divGrupo);
        });

        acordeon.appendChild(header);
        acordeon.appendChild(body);
        listaRutinaEjercicios.appendChild(acordeon);
    });
}


/* ---------- PASO 4: registrar el peso de un ejercicio ----------
    - POST /historial con { personaId, rutinaId, ejercicio, peso, fecha }.
    - Después del POST actualiza historialActual y refresca la preview.
    - Cierra el form inline y muestra el toast de confirmación.
*/
async function registrarPeso(ejercicio, peso, itemElement) {
    try {
        await axios.post(`${URL_BASE}/historial`, {
            personaId: personaElegida,
            rutinaId:  String(selectorRutinaHistorial.value),
            ejercicio: ejercicio.nombre.trim(),
            peso,
            fecha: new Date().toISOString().slice(0, 10)
        });

        // actualiza historialActual en memoria y refresca la preview
        await cargarHistorial();
        await cargarEjerciciosRutina(selectorRutinaHistorial.value);

        // cierra el form inline
        itemElement.classList.remove("activo");
        mostrarToast(`¡Peso guardado para ${ejercicio.nombre}!`);

    } catch (error) {
        console.error("Error al registrar peso:", error);
    }
}


/* ---------- PASO 5: cargar historial en memoria ----------
    Trae todos los registros de la persona activa, los normaliza y los
    ordena del más nuevo al más viejo. Se guarda en historialActual para
    que dibujarPreviewRutina pueda mostrar el último peso sin GET extra.
*/
async function cargarHistorial() {
    if (!personaElegida) return;

    try {
        const respuesta  = await axios.get(`${URL_BASE}/historial`);
        const registros  = (respuesta.data || [])
            .map(registro => ({
                ...registro,
                personaId:  String(registro.personaId  ?? "").trim(),
                rutinaId:   String(registro.rutinaId   ?? "").trim(),
                ejercicio:  String(registro.ejercicio  ?? "").trim(),
                fecha:      String(registro.fecha      ?? "").trim() || "Sin fecha"
            }))
            .filter(r => r.personaId === String(personaElegida))
            .filter(r => r.ejercicio.length > 0)
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

        historialActual = registros;

    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
}


/* ---------- PASO 6: guardar notas del entrenador ----------
    PASO 6A — sugerencia: PATCH /personas/:id con el texto del textarea.
    PASO 6B — dificultades: mismo patrón, campo distinto.
*/
formularioSugerencia.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        await axios.patch(`${URL_BASE}/personas/${personaElegida}`, {
            sugerencia: inputSugerencia.value
        });
        mostrarToast("¡Sugerencia guardada!");
        await cargarNotasPersona(personaElegida);

    } catch (error) {
        console.error("Error al guardar la sugerencia:", error);
    }
});

formularioDificultades.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        await axios.patch(`${URL_BASE}/personas/${personaElegida}`, {
            dificultades: inputDificultades.value
        });
        mostrarToast("¡Notas guardadas!");
        await cargarNotasPersona(personaElegida);
    } catch (error) {
        console.error("Error al guardar dificultades:", error);
    }
});


/* ---------- PASO 7: progreso de cargas en la columna izquierda ----------
    Por cada ejercicio de la rutina muestra los últimos 5 pesos registrados
    en orden cronológico (más viejo primero → más nuevo al final) para ver
    la progresión de un vistazo.
    Si un ejercicio no tiene registros, no se muestra en la lista.
*/
function dibujarProgresoEjercicios(ejercicios) {
    const contenedor = document.getElementById("progreso-ejercicios");
    // conservamos el h2, reemplazamos solo lo que sigue
    contenedor.innerHTML = "<h2>Progreso de cargas</h2>";

    if (ejercicios.length === 0) {
        contenedor.innerHTML += "<p class='vacio'>Sin ejercicios en esta rutina.</p>";
        return;
    }

    let hayRegistros = false;

    ejercicios.forEach(ej => {
        const nombreEj = ej.nombre.trim().toLowerCase();

        // buscamos todos los registros de este ejercicio, del más viejo al más nuevo
        const registros = historialActual
            .filter(r => r.ejercicio.toLowerCase() === nombreEj)
            .slice()           // no mutar el array original
            .reverse()         // historialActual viene de nuevo a viejo; reverse → viejo a nuevo
            .slice(-5);        // máximo últimos 5

        if (registros.length === 0) return; // sin historial: no dibujamos este ejercicio
        hayRegistros = true;

        const bloque = document.createElement("div");
        bloque.className = "progreso-ejercicio";

        const titulo = document.createElement("div");
        titulo.className   = "progreso-ejercicio__nombre";
        titulo.textContent = ej.nombre.trim();
        bloque.appendChild(titulo);

        const lista = document.createElement("div");
        lista.className = "progreso-ejercicio__registros";

        registros.forEach((reg, idx) => {
            const fila = document.createElement("div");
            fila.className = "progreso-registro";

            // flecha de comparación con el registro anterior
            let indicador = "";
            if (idx > 0) {
                const pesoActual   = parseFloat(registros[idx].peso);
                const pesoAnterior = parseFloat(registros[idx - 1].peso);
                if (pesoActual > pesoAnterior)      indicador = " ↑";
                else if (pesoActual < pesoAnterior) indicador = " ↓";
            }

            const spanFecha = document.createElement("span");
            spanFecha.className   = "progreso-registro__fecha";
            spanFecha.textContent = reg.fecha;

            const spanPeso = document.createElement("span");
            spanPeso.className   = "progreso-registro__peso";
            spanPeso.textContent = `${reg.peso} kg${indicador}`;

            const btnEditar = document.createElement("button");
            btnEditar.className   = "btn-registro btn-registro--editar";
            btnEditar.textContent = "✏";
            btnEditar.title       = "Editar peso";
            btnEditar.addEventListener("click", () => activarEdicionRegistro(reg, fila, ejercicios));

            const btnBorrar = document.createElement("button");
            btnBorrar.className   = "btn-registro btn-registro--borrar";
            btnBorrar.textContent = "✕";
            btnBorrar.title       = "Borrar registro";
            btnBorrar.addEventListener("click", () => borrarRegistroHistorial(reg.id, ejercicios));

            fila.appendChild(spanFecha);
            fila.appendChild(spanPeso);
            fila.appendChild(btnEditar);
            fila.appendChild(btnBorrar);
            lista.appendChild(fila);
        });

        bloque.appendChild(lista);
        contenedor.appendChild(bloque);
    });

    if (!hayRegistros) {
        contenedor.innerHTML += "<p class='vacio'>Todavía no hay pesos registrados para esta rutina.</p>";
    }
}


/* ---------- PASO 8: editar y borrar registros del historial ----------

    activarEdicionRegistro: convierte la fila en un input inline para editar
    el peso. Al guardar hace PATCH /historial/:id y refresca todo.

    borrarRegistroHistorial: DELETE /historial/:id y refresca.
*/
function activarEdicionRegistro(reg, filaElement, ejercicios) {
    // evitar doble apertura si ya está en modo edición
    if (filaElement.querySelector("input")) return;

    // reemplazamos el span de peso por un input editable
    const spanPeso = filaElement.querySelector(".progreso-registro__peso");
    const inputPeso = document.createElement("input");
    inputPeso.type  = "number";
    inputPeso.value = reg.peso;
    inputPeso.min   = "0";
    inputPeso.step  = "0.5";
    inputPeso.className = "progreso-registro__input";
    spanPeso.replaceWith(inputPeso);

    // cambiamos el botón ✏ por "Guardar"
    const btnEditar = filaElement.querySelector(".btn-registro--editar");
    btnEditar.textContent = "✓";
    btnEditar.title       = "Guardar";

    // al hacer click en ✓ → PATCH y redibujamos
    btnEditar.replaceWith(btnEditar.cloneNode(true)); // limpiamos el listener viejo
    const btnGuardar = filaElement.querySelector(".btn-registro--editar");
    btnGuardar.addEventListener("click", async () => {
        const nuevoPeso = inputPeso.value.trim();
        if (!nuevoPeso) return;
        await axios.patch(`${URL_BASE}/historial/${reg.id}`, { peso: nuevoPeso });
        await cargarHistorial();
        await cargarEjerciciosRutina(selectorRutinaHistorial.value);
        mostrarToast("¡Registro actualizado!");
    });

    inputPeso.focus();
}

async function borrarRegistroHistorial(id, ejercicios) {
    await axios.delete(`${URL_BASE}/historial/${id}`); // borramos el registro del servidor
    await cargarHistorial(); // actualizamos historialActual en memoria
    await cargarEjerciciosRutina(selectorRutinaHistorial.value); // redibujamos progreso y preview
    mostrarToast("Registro eliminado.");
}


/* ---------- PASO 9: preview de la rutina seleccionada ----------
    Muestra la rutina agrupada por día y grupo muscular en la columna
    derecha. Para cada ejercicio busca el último peso registrado en
    historialActual y lo muestra debajo del nombre.
*/
function dibujarPreviewRutina(rutina, ejercicios, diasTitulos) {
    const nombre   = document.getElementById("preview-rutina-nombre");
    const diasDiv  = document.getElementById("preview-rutina-dias");
    const ejercDiv = document.getElementById("preview-rutina-ejercicios");

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

    ejercDiv.innerHTML = "";

    if (ejercicios.length === 0) {
        ejercDiv.innerHTML = '<p class="vacio">Sin ejercicios aún</p>';
        return;
    }

    // mapa dia → titulo
    const mapaTitulos = {};
    (diasTitulos || []).forEach(t => { mapaTitulos[t.dia] = t.titulo; });

    // agrupamos por día
    const porDia = {};
    ejercicios.forEach(ej => {
        const dia = ej.dia || "Sin día";
        if (!porDia[dia]) porDia[dia] = [];
        porDia[dia].push(ej);
    });

    Object.keys(porDia).forEach(dia => {
        const tituloCompleto = mapaTitulos[dia] ? `${dia} — ${mapaTitulos[dia]}` : dia;

        const divDia = document.createElement("div");
        divDia.className = "dia-grupo";

        const headerDia = document.createElement("div");
        headerDia.className   = "dia-grupo__header";
        headerDia.textContent = tituloCompleto;
        divDia.appendChild(headerDia);

        // agrupamos por grupo muscular
        const porGrupo = {};
        porDia[dia].forEach(ej => {
            const grupo = ej.grupoMuscular || "Sin grupo";
            if (!porGrupo[grupo]) porGrupo[grupo] = [];
            porGrupo[grupo].push(ej);
        });

        Object.keys(porGrupo).forEach(grupo => {
            const divGrupo = document.createElement("div");
            divGrupo.className = "grupo-muscular";

            const tituloGrupo = document.createElement("div");
            tituloGrupo.className   = "grupo-muscular__titulo";
            tituloGrupo.textContent = grupo;
            divGrupo.appendChild(tituloGrupo);

            porGrupo[grupo].forEach(ej => {
                // último peso registrado para este ejercicio
                const ultimoReg  = historialActual.find(
                    r => r.ejercicio.toLowerCase() === ej.nombre.trim().toLowerCase()
                );
                const ultimoPeso = ultimoReg
                    ? `Último: ${ultimoReg.peso}kg · ${ultimoReg.fecha}`
                    : "Sin registros aún";

                const item = document.createElement("div");
                item.className = "preview-ejercicio";
                item.innerHTML = `
                    <strong>${ej.nombre}</strong>
                    <span>${ej.series} series × ${ej.repeticiones} reps · ${ej.descanso}</span>
                    <span class="preview-ejercicio__peso">${ultimoPeso}</span>
                `;
                divGrupo.appendChild(item);
            });

            divDia.appendChild(divGrupo);
        });

        ejercDiv.appendChild(divDia);
    });
}


/* ---------- ARRANQUE ----------
    iniciar() llama a cargarPersonas(), que al terminar dispara el resto
    en cadena. Es el único punto de entrada del módulo.
*/
async function iniciar() {
    await cargarPersonas();
}

iniciar();
