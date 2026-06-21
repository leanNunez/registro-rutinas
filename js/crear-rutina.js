const URL_BASE = "http://localhost:3000";

//Variables globales
let personaElegida = null;
let rutinaElegida = null;

//Referencias al DOM
const selectorPersona = document.getElementById("selector-persona");
const datosPersonaDiv = document.getElementById("datos-persona");

const formRutina = document.getElementById("formulario-rutina");
const inputRutinaNombre = document.getElementById("rutina-nombre");
const listaRutinaDiv = document.getElementById("lista-rutinas");

const selectorRutina = document.getElementById("selector-rutina");
const formEjercicio = document.getElementById("formulario-ejercicio");
const inputEjNombre = document.getElementById("ejercicio-nombre");
const inputEjSeries = document.getElementById("ejercicio-series");
const inputEjReps = document.getElementById("ejercicio-repeticiones");
const inputEjDescanso = document.getElementById("ejercicio-descanso");
const listaEjerciciosDiv = document.getElementById("lista-ejercicios");

const formDieta = document.getElementById("formulario-dieta");
const inputDietaMomento = document.getElementById("dieta-momento");
const inputDietaDesc = document.getElementById("dieta-descripcion");
const listaDietaDiv = document.getElementById("lista-dieta");

//Funciones

async function cargarPersonas(){
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas`);
        const personas = respuesta.data;

        selectorPersona.innerHTML = "";

        if (personas.length === 0){
            mostrarVacio(datosPersonaDiv, "No hay personas registradas.");
            return;
        }

        personas.forEach(persona => {
            const opcion =document.createElement("option");
            opcion.value = persona.id; 
            opcion.textContent = persona.nombre;
            selectorPersona.appendChild(opcion);
        });
        
        //Selecciona la primera persona y carga todo
        personaElegida = personas[0].id;
        await mostrarDatosPersona(personaElegida);
        await cargarRutinas();
        await cargarDieta();

    } catch (error) {
        console.error("Error al cargar personas:", error);
    }
}

async function mostrarDatosPersona(id){
    try {
        const respuesta = await axios.get(`${URL_BASE}/personas/${id}`);
        const p = respuesta.data;

        //Calculo IMC
        const imc = p.estatura ? (p.peso / (p.estatura * p.estatura)).toFixed(1) : "—";

        datosPersonaDiv.innerHTML = `
      <div class="datos-grilla">
        <div class="dato-item">
          <div class="dato-item__valor">${p.peso ?? "—"}</div>
          <div class="dato-item__etiqueta">Peso (kg)</div>
        </div>
        <div class="dato-item">
          <div class="dato-item__valor">${p.estatura ?? "—"}</div>
          <div class="dato-item__etiqueta">Estatura (m)</div>
        </div>
        <div class="dato-item">
          <div class="dato-item__valor">${imc}</div>
          <div class="dato-item__etiqueta">IMC</div>
        </div>
        <div class="dato-item">
          <div class="dato-item__valor" style="font-size:1rem">${p.objetivo ?? "—"}</div>
          <div class="dato-item__etiqueta">Objetivo</div>
        </div>
      </div>
      `;
        

    } catch (error) {
        console.error("Error al cargar datos de la persona:", error);   
    }
}


//Mostrar rutina de la persona
async function cargarRutinas(){
    try {
        const respuesta = await axios.get(`${URL_BASE}/rutinas?personaId=${personaElegida}`);
        const rutinas = respuesta.data;

        listaRutinaDiv.innerHTML = "";
        selectorRutina.innerHTML = "";

        if (rutinas.length === 0){
            console.log("Esta persona no tiene rutinas todavia.");
            console.log("Primero agregá una rutina.");
            rutinaElegida = null;
            return;
        }

        rutinas.forEach(rutina => {
            //Tarjeta de rutina
            const dias = Array.isArray(rutina.dias) ? rutina.dias : [];

            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";
            tarjeta.innerHTML = `
            <div class="tarjeta__info">
                <div class="tarjeta__nombre">${rutina.nombre}</div>
                <div class="dias-tags">
                    ${dias.map(d => `<span class="dia-tag">${d}</span>`).join("") || "<span class='tarjeta__detalle'>Sin días asignados</span>"}
                </div>
            </div>
            <div class="tarjeta__acciones">
                <button class="btn-editar" data-id="${rutina.id}">Editar</button>
                <button class="btn-borrar" data-id="${rutina.id}">Borrar</button>
            </div>
            `;  

            //Boton editar rutina
            tarjeta.querySelector(".btn-editar").addEventListener("click", () => {
                editarRutina(rutina);
            });

            //Boton borrar rutina
            tarjeta.querySelector(".btn-borrar").addEventListener("click", () => {
                borrarRutina(rutina.id);
            });

            listaRutinaDiv.appendChild(tarjeta);

            //Opcion en el selector de rutinas
            const opcion = document.createElement("option");
            opcion.value = rutina.id;
            opcion.textContent = rutina.nombre;
            selectorRutina.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al cargar rutinas:", error);
    }
}

//Crear rutina
formRutina.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = inputRutinaNombre.value.trim();
    if (!nombre){
        console.log("Escribí un nombre para la rutina.");
        return;
    }

    const diasMarcados = [...document.querySelectorAll('#formulario-rutina input[name="dia"]:checked')]
    .map(cb => cb.value);

    try {
        await axios.post(`${URL_BASE}/rutinas`, {
            personaId: personaElegida,
            nombre,
            dias: diasMarcados
        });

        formRutina.reset();
        await cargarRutinas();
        console.log(`Rutina "${nombre}" creada correctamente.`);
    } catch (error) {
        console.error("Error al crear rutina:", error);
    }
});

//Borrar rutina
async function borrarRutina(id) {
    if (!confirm("¿Esta seguro de borrar esta rutina? Tambien se van a eliminar los ejercicos.")) return;

    try {
        await axios.delete(`${URL_BASE}/rutinas/${id}`);
        await cargarRutinas();
    } catch (error) {
        console.error("Error al borrar rutina:", error);
    }
}

//Editar rutina
async function editarRutina(rutina) {
    //Cargar los datos actuales del formulario
    inputRutinaNombre.value = rutina.nombre;

    //Marcar los dias que ya tiene
    document.querySelectorAll('#formulario-rutina input[name="dia"]').forEach(cb => {
        cb.checked = Array.isArray(rutina.dias) && rutina.dias.includes(cb.value);
    });

    //Se cambia el boton al guardar cambios
    const btnSubmit = formRutina.querySelector("button[type='submit']");
    btnSubmit.textContent = "Guardar cambios";

    // Reemplaza el listener del submit temporalmente
  const guardarCambios = async (evento) => {
    evento.preventDefault();

    const nuevoNombre = inputRutinaNombre.value.trim();
    if (!nuevoNombre) {
      console.log("Escribí un nombre para la rutina.");
      return;
    }

    const diasMarcados = [...document.querySelectorAll('#formulario-rutina input[name="dia"]:checked')]
      .map(cb => cb.value);

    try {
      await axios.put(`${URL_BASE}/rutinas/${rutina.id}`, {
        nombre: nuevoNombre,
        dias: diasMarcados
      });

      // Restaura el formulario a modo "crear"
      formRutina.reset();
      btnSubmit.textContent = "Agregar rutina";
      formRutina.removeEventListener("submit", guardarCambios);
      formRutina.addEventListener("submit", crearRutinaListener);

      await cargarRutinas();
      console.log(`Rutina "${nuevoNombre}" actualizada.`);


    } catch (error) {
      console.error("Error al editar rutina, no se pudo guardar el cambio:", error);
    }
  };

  //Quita el listener original y pone el de edicion
  formRutina.removeEventListener("submit", crearRutinaListener);
  formRutina.addEventListener("submit", guardarCambios);

  //Hace scroll suave al formulario
  inputRutinaNombre.scrollIntoView({ behavior: "smooth", block: "center" });
  inputRutinaNombre.focus();
}

//Referencia al listener original (necesaria para poder quitarlo y volver a ponerlo)
function crearRutinaListener(evento) {
  formRutina.dispatchEvent(new Event("submit"));
}

//EJERCICIOS DE LA RUTINA
async function cargarEjercicios() {
    if (!rutinaElegida) {
        console.log("Seleccioná una rutina para ver sus ejercicios.");
        return;
    }

    try {
        const respuesta = await axios.get(`${URL_BASE}/ejercicios?rutinaId=${rutinaElegida}`);
        const ejercicios = respuesta.data;

        listaEjerciciosDiv.innerHTML = "";

        if (ejercicios.length === 0) {
            console.log("Esta rutina no tiene ejercicios todavia.");
            return;
        }

        ejercicios.forEach(ej => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";
            tarjeta.innerHTML = `
                <div class="tarjeta__info">
                    <div class="tarjeta__nombre">${ej.nombre}</div>
                    <div class="tarjeta__detalle">
                        ${ej.series} series · ${ej.repeticiones} reps · Descanso: ${ej.descanso}
                    </div>
                </div>
                <div class="tarjeta__acciones">
                    <button class="btn-editar" data-id="${ej.id}">Editar</button>
                    <button class="btn-borrar" data-id="${ej.id}">Borrar</button>
                </div>
            `;

            tarjeta.querySelector(".btn-borrar").addEventListener("click", () => {
                borrarEjercicio(ej.id);
            });

            tarjeta.querySelector(".btn-editar").addEventListener("click", () => {
                editarEjercicio(ej);
            });

            listaEjerciciosDiv.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar ejercicios:", error);
    }
}

//Crear ejercicio
async function crearEjercicioListener(evento) {
    evento.preventDefault();

    const nombre = inputEjNombre.value.trim();
    if (!nombre){
        console.log("Escribí el nombre del ejercicio.");
        return;
    }
    if (!rutinaElegida){
        console.log("Seleccioná una rutina primero.");
        return;
    }

    try {
        await axios.post(`${URL_BASE}/ejercicios`, {
            rutinaId: rutinaElegida,
            nombre,
            series: Number(inputEjSeries.value) || 0,
            repeticiones: Number(inputEjReps.value) || 0,
            descanso: inputEjDescanso.value.trim() || "—"
        });

        formEjercicio.reset();
        await cargarEjercicios();
        console.log(`Ejercicio "${nombre}" agregado.`);

    } catch (error) {
        console.error("Error al crear ejercicio:", error);
    }
}

// Listener nombrado para poder remover/añadir durante edición
formEjercicio.addEventListener("submit", crearEjercicioListener);

//Borrar ejercicio  
async function borrarEjercicio(id) {
    if (!confirm("¿Borrar este ejercicio?")) return;

    try {
        await axios.delete(`${URL_BASE}/ejercicios/${id}`);
        await cargarEjercicios();
        
    } catch (error) {
        console.error("Error al borrar ejercicio:", error);
    }
}

//Editar ejercicio
async function editarEjercicio(ej) {
  inputEjNombre.value   = ej.nombre;
  inputEjSeries.value   = ej.series;
  inputEjReps.value     = ej.repeticiones;
  inputEjDescanso.value = ej.descanso;

  const btnSubmit = formEjercicio.querySelector("button[type='submit']");
  btnSubmit.textContent = "Guardar cambios";

  const escucharGuardado = async (evento) => {
    evento.preventDefault();

    const nuevoNombre = inputEjNombre.value.trim();
    if (!nuevoNombre) {
      console.log("Escribí el nombre del ejercicio.");
      return;
    }

    try {
      await axios.put(`${URL_BASE}/ejercicios/${ej.id}`, {
        nombre:       nuevoNombre,
        series:       Number(inputEjSeries.value)    || 0,
        repeticiones: Number(inputEjReps.value)       || 0,
        descanso:     inputEjDescanso.value.trim()    || "—"
      });

      formEjercicio.reset();
      btnSubmit.textContent = "Agregar ejercicio";
            // Restaurar listener original
            formEjercicio.removeEventListener("submit", escucharGuardado);
            formEjercicio.addEventListener("submit", crearEjercicioListener);

      await cargarEjercicios();
      console.log(`Ejercicio "${nuevoNombre}" actualizado.`);
/* ---------- PASO 0: una variable para saber qué persona está elegida ----------
   Vas a necesitar recordar el id de la persona elegida y el de la rutina elegida.
   Consejo: declará  let personaElegida  y  let rutinaElegida  arriba de todo.
*/
let personaElegida = null;
let rutinaElegida = null;

/* ---------- PASO 1: llenar el selector de personas ----------
   - Traé las personas con axios.get(".../personas").
   - Recorré la lista con forEach.
   - Por cada persona creá un <option>, ponele .value = persona.id y
   .textContent = persona.nombre, y agregalo al <select id="selector-persona">.
   - Al final, elegí la primera persona y mostrá sus datos (PASO 2).
*/
const cargarPersonas = async () => {
   const respuesta = await axios.get("http://localhost:3000/personas");
   const personas = respuesta.data;
   const selectorPersona = document.getElementById("selector-persona");
   personas.forEach(persona => {
      const option = document.createElement("option");
      option.value = persona.id;
      option.textContent = persona.nombre;
      selectorPersona.appendChild(option);
   })
   personaElegida = personas[0].id;

   mostrarDatosPersona(personaElegida)
   
   // escuchador de cambios en el select
   selectorPersona.addEventListener("change" , ()=>{
      personaElegida = selectorPersona.value
      mostrarDatosPersona(personaElegida)
   })
}

    } catch (error) {
      console.error("Error al editar ejercicio:", error);
    }
  };

    // Reemplaza el listener original por el de guardado temporal
    formEjercicio.removeEventListener("submit", crearEjercicioListener);
    formEjercicio.addEventListener("submit", escucharGuardado);

  inputEjNombre.scrollIntoView({ behavior: "smooth", block: "center" });
}

//DIETA
async function cargarDieta() {
    try {
        const respuesta = await axios.get(`${URL_BASE}/dietas?personaId=${personaElegida}`);
        const comidas = respuesta.data;

        listaDietaDiv.innerHTML = "";

        if (comidas.length === 0) {
            console.log("Esta persona no tiene comidas registradas.");
            return;
        }

        comidas.forEach(comida => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";
            tarjeta.innerHTML = `
                <div class="tarjeta__info">
                    <div class="tarjeta__nombre">${comida.momento}</div>
                    <div class="tarjeta__detalle">${comida.descripcion}</div>
                </div>
                <div class="tarjeta__acciones">
                    <button class="btn-editar" data-id="${comida.id}">Editar</button>
                    <button class="btn-borrar" data-id="${comida.id}">Borrar</button>
                </div>
            `;

            tarjeta.querySelector(".btn-borrar").addEventListener("click", () => {
                borrarComida(comida.id);
            });

            tarjeta.querySelector(".btn-editar").addEventListener("click", () => {
                editarComida(comida);
            });

            listaDietaDiv.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar dieta:", error);
    }
}

//Crear comida
async function crearComidaListener(evento) {
    evento.preventDefault();

    const momento = inputDietaMomento.value.trim();
    const descripcion = inputDietaDesc.value.trim();

    if (!momento || !descripcion){
        console.log("Completa la comida y la descripcion.");
        return;
    }

    try {
        await axios.post(`${URL_BASE}/dietas`, {
            personaId: personaElegida,
            momento,
            descripcion
        });

        formDieta.reset();
        await cargarDieta();
        console.log(`Comida "${momento}" agregada.`);

    } catch (error) {
        console.error("Error al crear comida:", error);
    }
}

// Listener nombrado para dieta
formDieta.addEventListener("submit", crearComidaListener);

//Borrar comida
async function borrarComida(id) {
    if (!confirm("¿Borrar esta comida?")) return;

    try {
        await axios.delete(`${URL_BASE}/dietas/${id}`);
        await cargarDieta();

    } catch (error) {
        console.error("Error al borrar comida:", error);
    }
}

//Editar comida
function editarComida(comida) {
  inputDietaMomento.value = comida.momento;
  inputDietaDesc.value    = comida.descripcion;

  const btnSubmit = formDieta.querySelector("button[type='submit']");
  btnSubmit.textContent = "Guardar cambios";

  const escucharGuardado = async (evento) => {
    evento.preventDefault();

    const nuevoMomento = inputDietaMomento.value.trim();
    const nuevaDesc    = inputDietaDesc.value.trim();

    if (!nuevoMomento || !nuevaDesc) {
      mostrarMensaje(formDieta, "Completá los dos campos.", "error");
      return;
    }

    try {
      await axios.put(`${URL_BASE}/dietas/${comida.id}`, {
        momento:     nuevoMomento,
        descripcion: nuevaDesc
      });

      formDieta.reset();
      btnSubmit.textContent = "Agregar a la dieta";
    // Restaurar listener original
    formDieta.removeEventListener("submit", escucharGuardado);
    formDieta.addEventListener("submit", crearComidaListener);

      await cargarDieta();
      mostrarMensaje(listaDietaDiv, `Comida "${nuevoMomento}" actualizada.`);

    } catch (error) {
      console.error("Error al editar comida:", error);
      mostrarMensaje(formDieta, "No se pudo guardar el cambio.", "error");
    }
  };

    // Reemplaza el listener original por el de guardado temporal
    formDieta.removeEventListener("submit", crearComidaListener);
    formDieta.addEventListener("submit", escucharGuardado);

  inputDietaMomento.scrollIntoView({ behavior: "smooth", block: "center" });
  inputDietaMomento.focus();
}

//LISTENER DE SELECTORES
//Cuando cambia la persona recarga todo
selectorPersona.addEventListener("change", async () => {
    personaElegida = selectorPersona.value;
    await mostrarDatosPersona(personaElegida);
    await cargarRutinas();
    await cargarDieta();
});

//Cuando cambia la rutina recarga los ejercicios
selectorRutina.addEventListener("change", async () => {
    rutinaElegida = selectorRutina.value;
    await cargarEjercicios();
});

//ARRANQUE
cargarPersonas();
cargarRutinas();
cargarDieta();
/* ---------- PASO 2: mostrar los datos de la persona ----------
   - Cuando cambia el <select> (addEventListener "change"), guardá personaElegida.
   - Traé la persona con axios.get(".../personas/" + personaElegida).
   - Escribí sus datos dentro de #datos-persona (peso, estatura, objetivo).
   - Extra: el IMC se calcula con  peso / (estatura * estatura).
   - Después de mostrar los datos, cargá sus rutinas (PASO 3) y su dieta (PASO 6).
*/
const mostrarDatosPersona = async (id) => {
   const respuesta = await axios.get("http://localhost:3000/personas/" + id);
   const persona = respuesta.data;
   const datosPersona = document.getElementById("datos-persona");
   datosPersona.innerHTML= "";

   const imc = (persona.peso / (persona.estatura * persona.estatura)).toFixed(1);
   // peso
   const parrafoPeso = document.createElement("p");
   parrafoPeso.textContent = `Peso : ${persona.peso} kg`;
   datosPersona.appendChild(parrafoPeso);
   // estatura
   const parrafoEstatura = document.createElement("p");
   parrafoEstatura.textContent = `Estatura : ${persona.estatura} m`;
   datosPersona.appendChild(parrafoEstatura)
   //objetivo
   const parrafoObjetivo = document.createElement ("p");
   parrafoObjetivo.textContent = `Objetivo : ${persona.objetivo}`
   datosPersona.appendChild(parrafoObjetivo)
   const parrafoImc = document.createElement("p");
   //imc
   parrafoImc.textContent = `IMC : ${imc}`;
   datosPersona.appendChild(parrafoImc);
   mostrarRutina(id);
   MostrarDieta(id);
}

/* ---------- PASO 3: mostrar las rutinas de la persona ----------
   - Traé las rutinas con axios.get(".../rutinas?personaId=" + personaElegida).
   - Vaciá #lista-rutinas (innerHTML = "").
   - Recorré con forEach y por cada rutina creá una tarjeta (un <div>) con el
   nombre y los días. Agregale un botón "Borrar" (PASO 5).
   - También llená el <select id="selector-rutina"> con estas rutinas (para los ejercicios).
*/
const mostrarRutina = async (id) => {
   const respuesta = await axios.get("http://localhost:3000/rutinas?personaId=" + id);
   const rutinas = respuesta.data;
   const listaRutinas = document.getElementById("lista-rutinas");
   listaRutinas.innerHTML = "";

   rutinas.forEach(rutina => {
      const divRutina = document.createElement("div");
      divRutina.textContent = `Nombre Rutina: ${rutina.nombre} - Días: ${rutina.dias.join(", ")}`;

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => {
         borrarRutina(rutina.id);
      });

      listaRutinas.appendChild(divRutina);
      listaRutinas.appendChild(botonBorrar);
   })

   //llenamos el selector de rutinas (para elegir a cuál agregarle ejercicios)
   const selectorRutina = document.getElementById("selector-rutina");
   selectorRutina.innerHTML = "";   // lo vaciamos antes de volver a llenarlo

   rutinas.forEach(rutina => {
      const option = document.createElement("option");
      option.value = rutina.id;
      option.textContent = rutina.nombre;
      selectorRutina.appendChild(option);
   })

   // Si hay al menos una rutina, elegimos la primera y mostramos sus ejercicios
   if (rutinas.length > 0) {
      rutinaElegida = rutinas[0].id;
      mostrarEjercicios(rutinaElegida);
   }
}

/* ---------- PASO 4: crear una rutina ----------
   - Escuchá el "submit" del #formulario-rutina (addEventListener).
   - Hacé evento.preventDefault() para que no se recargue la página.
   - Leé el nombre (.value) y juntá los días marcados:
      document.querySelectorAll("#formulario-rutina input[name=dia]:checked")
      y por cada uno guardá su .value en un array.
   - Creá la rutina con axios.post(".../rutinas", { personaId, nombre, dias }).
   - Limpiá el formulario (.reset()) y volvé a mostrar las rutinas (PASO 3).
*/
document.getElementById("formulario-rutina").addEventListener("submit", async (evento) => {
  // 1. Frenamos que la página se recargue sola al enviar el form
   evento.preventDefault();

  // 2. Leemos el nombre que escribió el usuario
   const nombre = document.getElementById("rutina-nombre").value;

  // 3. Armamos el array de días tildados
   const dias = [];
   //seleccionamos el formulario por su id con #, luego traemos todos los imputs con el nombre = dia, pero con :checked solo tramemos los que esten seleccionados
   document.querySelectorAll("#formulario-rutina input[name=dia]:checked").forEach(check => {
      dias.push(check.value);
   });
// 4. Mandamos la rutina nueva al servidor
   await axios.post("http://localhost:3000/rutinas", {
      personaId: personaElegida,
      nombre: nombre,
      dias: dias
   });

   // 5. Limpiamos el formulario (vuelve a quedar vacío)
   document.getElementById("formulario-rutina").reset();

   // 6. Volvemos a mostrar la lista de rutinas, ya actualizada
   mostrarRutina(personaElegida);
});

/* ---------- PASO 5: borrar una rutina ----------
   - En el botón "Borrar" de cada tarjeta, al hacer click:
      axios.delete(".../rutinas/" + id)  y después volvé a mostrar las rutinas.
*/
const borrarRutina = async (id)=>{
   await axios.delete("http://localhost:3000/rutinas/"+id)
   mostrarRutina(personaElegida)
}

/* ---------- PASO 6: ejercicios (de la rutina elegida) ----------
   Es el MISMO patrón que rutinas, pero con ejercicios:
   - Mostrar: axios.get(".../ejercicios?rutinaId=" + rutinaElegida) y dibujar tarjetas.
   - Crear: leer los inputs (series y repeticiones convertilos con Number(...)),
      axios.post(".../ejercicios", { rutinaId, nombre, series, repeticiones, descanso }).
   - Borrar:  axios.delete(".../ejercicios/" + id).
   - Acordate de recargar la lista al cambiar el #selector-rutina.
*/
const mostrarEjercicios = async (id) => {
   const respuesta = await axios.get("http://localhost:3000/ejercicios?rutinaId=" + id);
   const ejercicios = respuesta.data;
   const listaEjercicios = document.getElementById("lista-ejercicios");
   listaEjercicios.innerHTML = "";

   ejercicios.forEach(ejercicio => {
      const divEjercicio = document.createElement("div");
      divEjercicio.textContent = `${ejercicio.nombre} - ${ejercicio.series} series x ${ejercicio.repeticiones} reps - Descanso: ${ejercicio.descanso}`;

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => {
         borrarEjercicio(ejercicio.id);
      });

      listaEjercicios.appendChild(divEjercicio);
      listaEjercicios.appendChild(botonBorrar);
   })
}

/* ---------- PASO 7: dieta ----------
   Otra vez el mismo patrón:
   - Mostrar: axios.get(".../dietas?personaId=" + personaElegida).
   - Crear:   axios.post(".../dietas", { personaId, momento, descripcion }).
   - Borrar:  axios.delete(".../dietas/" + id).
*/
//Mostar
const MostrarDieta = async (id)=>{
   const respuesta = await axios.get("http://localhost:3000/dietas?personaId=" + id);
   const dietas = respuesta.data
   const listaDieta = document.getElementById("lista-dieta");
   listaDieta.innerHTML = "";

   dietas.forEach(dieta => {
      const divDieta = document.createElement("div");
      divDieta.textContent = `${dieta.momento} : ${dieta.descripcion}`;

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => {
         BorrarDieta(dieta.id);
      });

      listaDieta.appendChild(divDieta);
      listaDieta.appendChild(botonBorrar);
   })
}
//Crear
document.getElementById("formulario-dieta").addEventListener("submit",async (evento)=>{
   evento.preventDefault()

   const momento = document.getElementById("dieta-momento").value;
   const descripcion = document.getElementById("dieta-descripcion").value;
   await axios.post("http://localhost:3000/dietas",{
      personaId : personaElegida,
      momento : momento,
      descripcion : descripcion
   })
   document.getElementById("formulario-dieta").reset();
   MostrarDieta(personaElegida)
})
//Borrar
const BorrarDieta = async (id)=>{
   await axios.delete("http://localhost:3000/dietas/" + id)
   MostrarDieta(personaElegida)
}

/* ---------- PASO 8: arrancar ----------
   Llamá a la función del PASO 1 al final del archivo para que todo empiece.
*/
cargarPersonas();
/* ---------- PASO 9: agregar una persona ----------
   - Escuchá el "submit" del #formulario-persona.
   - Hacé evento.preventDefault() para que no se recargue la página.
   - Leé los 5 campos: nombre, edad, peso, estatura, objetivo.
   - OJO: edad, peso y estatura son números -> usá Number(...) en cada uno.
   - Mandá la persona nueva con axios.post a "/personas".
   - IMPORTANTE: antes de volver a llamar cargarPersonas(), vaciá el selector
      de personas (selectorPersona.innerHTML = ""), porque si no, las opciones
      viejas se acumulan arriba de las nuevas cada vez que se agrega alguien.
   - Limpiá el formulario con .reset() y llamá a cargarPersonas() para que
      la nueva persona aparezca en el selector y quede seleccionada.
*/
document.getElementById("formulario-persona").addEventListener("submit", async (evento) => {
   evento.preventDefault();

   // Leemos los campos (edad, peso y estatura como números)
   const nombre    = document.getElementById("persona-nombre").value;
   const edad      = Number(document.getElementById("persona-edad").value);
   const peso      = Number(document.getElementById("persona-peso").value);
   const estatura  = Number(document.getElementById("persona-estatura").value);
   const objetivo  = document.getElementById("persona-objetivo").value;

   // Mandamos la persona nueva al servidor
   await axios.post("http://localhost:3000/personas", {
      nombre   : nombre,
      edad     : edad,
      peso     : peso,
      estatura : estatura,
      objetivo : objetivo,
      sugerencia: ""   // empieza vacío, se llena desde historial
   });

   // Limpiamos el formulario
   document.getElementById("formulario-persona").reset();

   // Vaciamos el selector ANTES de volver a llenarlo (importante)
   document.getElementById("selector-persona").innerHTML = "";

   // Volvemos a cargar todas las personas (aparece la nueva)
   cargarPersonas();
});
