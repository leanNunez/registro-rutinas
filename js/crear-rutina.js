/* ---------- PASO 0: variables globales ----------
   personaElegida:   id de la persona activa entre funciones.
   rutinaElegida:    id de la rutina activa (para ejercicios, dieta y títulos).
   rutinaEditando:   null = modo crear | id = modo editar rutina.
   rutinasEnMemoria: guarda el array de rutinas para poblar los selects
                     de día sin hacer un GET extra cada vez.
*/
let personaElegida      = null;
let rutinaElegida       = null;
let rutinaEditando      = null;
let ejercicioEditando   = null;   // null = modo crear | id = modo editar ejercicio
let rutinasEnMemoria    = [];

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

/* ---------- PASO 2: mostrar los datos de la persona ----------
   - Traé la persona con axios.get(".../personas/" + id).
   - Vaciá #datos-persona y escribí peso, estatura, objetivo e IMC.
   - Extra: el IMC se calcula con  peso / (estatura * estatura).
   - Al terminar, llamá a mostrarRutina(id): ella se encarga de cargar
      las rutinas, los ejercicios y la dieta de la primera rutina (PASO 3).
   - OJO: ya no llamamos MostrarDieta acá — la dieta pertenece a la rutina,
      no a la persona, así que se carga desde mostrarRutina.
*/
const mostrarDatosPersona = async (id) => {
   const respuesta = await axios.get("http://localhost:3000/personas/" + id);
   const persona = respuesta.data;
   const datosPersona = document.getElementById("datos-persona");
   datosPersona.innerHTML= "";

   const estaturaM = persona.estatura / 100;
   const imc = (persona.peso && estaturaM)
      ? (persona.peso / (estaturaM * estaturaM)).toFixed(1)
      : "—";
   // peso
   const parrafoPeso = document.createElement("p");
   parrafoPeso.textContent = `Peso : ${persona.peso} kg`;
   datosPersona.appendChild(parrafoPeso);
   // estatura
   const parrafoEstatura = document.createElement("p");
   const estaturaDisplay = `${persona.estatura} cm`;
   parrafoEstatura.textContent = `Estatura : ${estaturaDisplay}`;
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
   // la dieta pertenece a la rutina, no a la persona — se carga desde mostrarRutina
}

/* ---------- PASO 3: mostrar las rutinas de la persona ----------
   - Traé las rutinas con axios.get(".../rutinas?personaId=" + id).
   - Vaciá #lista-rutinas y dibujá una tarjeta con botones "Editar" y "Borrar".
   - Llenás también el <select id="selector-rutina"> con las mismas rutinas.
   - Guardá las rutinas en rutinasEnMemoria para usar los días sin GET extra.
   - Si hay al menos una rutina:
         · Guardás rutinaElegida = rutinas[0].id (la primera queda seleccionada).
         · Llamás mostrarEjercicios, MostrarDieta y poblarSelectoresDia.
         · Disparás "change" en #selector-rutina para que preview-rutina.js
            actualice el nombre en la tarjeta de vista previa.
   - Si NO hay rutinas: limpiás las listas y disparás "change" para resetear el preview.
*/
const mostrarRutina = async (id) => {
   const respuesta = await axios.get("http://localhost:3000/rutinas?personaId=" + id);
   const rutinas = respuesta.data;
   const listaRutinas = document.getElementById("lista-rutinas");
   listaRutinas.innerHTML = "";

   // guardamos en memoria para que poblarSelectoresDia pueda usarlos sin GET extra
   rutinasEnMemoria = rutinas;

   rutinas.forEach(rutina => {
      const divRutina = document.createElement("div");
      divRutina.textContent = `Nombre Rutina: ${rutina.nombre} - Días: ${rutina.dias.join(", ")}`;

      const botonEditar = document.createElement("button");
      botonEditar.textContent = "Editar";
      botonEditar.addEventListener("click", () => activarModoEdicion(rutina));

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => borrarRutina(rutina.id));

      listaRutinas.appendChild(divRutina);
      listaRutinas.appendChild(botonEditar);
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

   // Si hay al menos una rutina, elegimos la primera y cargamos todo
   if (rutinas.length > 0) {
      rutinaElegida = rutinas[0].id;
      mostrarEjercicios(rutinaElegida);
      MostrarDieta(rutinaElegida);
      mostrarTitulosDia(rutinaElegida);
      poblarSelectoresDia(rutinaElegida);
      // dispara "change" para que preview-rutina.js actualice el nombre en la tarjeta
      document.getElementById("selector-rutina").dispatchEvent(new Event("change"));
   } else {
      // sin rutinas: limpiamos las listas para que los MutationObservers limpien el preview
      rutinaElegida = null;
      document.getElementById("lista-ejercicios").innerHTML = "";
      document.getElementById("lista-titulos-dia").innerHTML = "";
      document.getElementById("lista-dieta").innerHTML = "";
      document.getElementById("selector-dia-titulo").innerHTML = "";
      document.getElementById("ejercicio-dia").innerHTML = "";
      // selector vacío → el listener en preview-rutina.js pondrá "Sin nombre"
      document.getElementById("selector-rutina").dispatchEvent(new Event("change"));
   }
}

/* ---------- PASO 3B: modo edición de rutina ----------
   activarModoEdicion: pre-llena el formulario con los datos de la rutina
   elegida y cambia el botón a "Guardar cambios".

   desactivarModoEdicion: resetea el formulario y vuelve al modo creación.
*/
const activarModoEdicion = (rutina) => {
   rutinaEditando = rutina.id; // guardamos el id para que el submit sepa que debe hacer PATCH y no POST
   document.getElementById("rutina-nombre").value = rutina.nombre; // pre-llenamos el input con el nombre actual
   document.querySelectorAll("#formulario-rutina input[name=dia]").forEach(cb => {
      cb.checked = rutina.dias.includes(cb.value); // tilda el checkbox si su value está en el array de días de la rutina
   });
   document.querySelector("#formulario-rutina button[type=submit]").textContent = "Guardar cambios"; // cambiamos el texto del botón
   document.getElementById("btn-cancelar-edicion").style.display = "inline-block"; // mostramos el botón cancelar
};

const desactivarModoEdicion = () => {
   rutinaEditando = null; // volvemos al modo creación (submit hará POST)
   document.getElementById("formulario-rutina").reset(); // limpia todos los campos del formulario
   document.querySelector("#formulario-rutina button[type=submit]").textContent = "Agregar rutina"; // restauramos el texto del botón
   document.getElementById("btn-cancelar-edicion").style.display = "none"; // ocultamos el botón cancelar
};

document.getElementById("btn-cancelar-edicion").addEventListener("click", desactivarModoEdicion);

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
   // 4. Crear o modificar según el modo activo
   if (rutinaEditando) {
      await axios.patch(`http://localhost:3000/rutinas/${rutinaEditando}`, { nombre, dias });
      desactivarModoEdicion(); // limpia el form y resetea el modo
   } else {
      await axios.post("http://localhost:3000/rutinas", {
         personaId: personaElegida,
         nombre: nombre,
         dias: dias
      });
      document.getElementById("formulario-rutina").reset();
   }

   // 5. Recarga la lista de rutinas actualizada
   mostrarRutina(personaElegida);
});

/* ---------- PASO 5: borrar una rutina ----------
   - En el botón "Borrar" de cada tarjeta, al hacer click:
      axios.delete(".../rutinas/" + id)  y después volvé a mostrar las rutinas.
*/
const borrarRutina = async (id) => {
   // eliminación en cascada: primero ejercicios, diasTitulos, dietas e historial
   const [respEj, respTit, respDiet, respHist] = await Promise.all([
      axios.get(`http://localhost:3000/ejercicios?rutinaId=${id}`),
      axios.get(`http://localhost:3000/diasTitulos?rutinaId=${id}`),
      axios.get(`http://localhost:3000/dietas?rutinaId=${id}`),
      axios.get(`http://localhost:3000/historial?rutinaId=${id}`)
   ]);

   await Promise.all([
      ...respEj.data.map(e  => axios.delete(`http://localhost:3000/ejercicios/${e.id}`)),
      ...respTit.data.map(t => axios.delete(`http://localhost:3000/diasTitulos/${t.id}`)),
      ...respDiet.data.map(d => axios.delete(`http://localhost:3000/dietas/${d.id}`)),
      ...respHist.data.map(h => axios.delete(`http://localhost:3000/historial/${h.id}`))
   ]);

   await axios.delete(`http://localhost:3000/rutinas/${id}`);
   mostrarRutina(personaElegida);
};

/* ---------- PASO 6: títulos de cada día ----------
   Cada día de una rutina puede tener un título que describe qué grupos
   musculares se trabajan ese día (ej: "Lunes → Pecho y Bíceps").

   mostrarTitulosDia: trae los títulos guardados para la rutina activa y
   los dibuja en #lista-titulos-dia con un botón Borrar por cada uno.

   El patrón es idéntico al de mostrarEjercicios y MostrarDieta.
*/
const mostrarTitulosDia = async (rutinaId) => {
   const respuesta   = await axios.get("http://localhost:3000/diasTitulos?rutinaId=" + rutinaId);
   const titulos     = respuesta.data;
   const listaTitulos = document.getElementById("lista-titulos-dia");
   listaTitulos.innerHTML = "";

   titulos.forEach(titulo => {
      const div = document.createElement("div");
      div.className = "tarjeta-titulo-dia";
      div.textContent = `${titulo.dia} — ${titulo.titulo}`;

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => borrarTituloDia(titulo.id));

      listaTitulos.appendChild(div);
      listaTitulos.appendChild(botonBorrar);
   });
};

/* ---------- PASO 6b: borrar un título de día ----------
   - axios.delete(".../diasTitulos/" + id)
   - Recargá la lista con mostrarTitulosDia.
*/
const borrarTituloDia = async (id) => {
   await axios.delete("http://localhost:3000/diasTitulos/" + id);
   mostrarTitulosDia(rutinaElegida);
};

/* ---------- PASO 6c: guardar el título de un día ----------
   - Leé el día elegido en #selector-dia-titulo y el texto de #input-titulo-dia.
   - POST /diasTitulos con { rutinaId, dia, titulo }.
   - Limpiá el formulario y recargá la lista.
*/
document.getElementById("formulario-titulo-dia").addEventListener("submit", async (evento) => {
   evento.preventDefault();

   const dia    = document.getElementById("selector-dia-titulo").value;
   const titulo = document.getElementById("input-titulo-dia").value;

   await axios.post("http://localhost:3000/diasTitulos", {
      rutinaId: rutinaElegida,
      dia,
      titulo
   });

   document.getElementById("formulario-titulo-dia").reset();
   // volvemos a poblar el select de día porque .reset() lo vaciaría en algunos navegadores
   poblarSelectoresDia(rutinaElegida);
   mostrarTitulosDia(rutinaElegida);
});

/* ---------- PASO 6d: poblar los selects de día ----------
   Cuando cambia la rutina elegida, los dos selects de día (el del form
   de títulos y el del form de ejercicios) tienen que mostrar solo los
   días de ESA rutina.

   Buscamos la rutina en rutinasEnMemoria para no hacer un GET extra.
   Vaciamos y rellenamos ambos selects con los días de esa rutina.
*/
const poblarSelectoresDia = (rutinaId) => {
   // buscamos la rutina en memoria (ya la tenemos del PASO 3)
   const rutina = rutinasEnMemoria.find(r => String(r.id) === String(rutinaId));
   if (!rutina) return;

   const selectorTitulo   = document.getElementById("selector-dia-titulo");
   const selectorEjercicio = document.getElementById("ejercicio-dia");

   // vaciamos y rellenamos ambos selects con los días de la rutina
   selectorTitulo.innerHTML   = "";
   selectorEjercicio.innerHTML = "";

   rutina.dias.forEach(dia => {
      // un <option> para el select de títulos
      const opcionTitulo = document.createElement("option");
      opcionTitulo.value = dia;
      opcionTitulo.textContent = dia;
      selectorTitulo.appendChild(opcionTitulo);

      // otro <option> para el select del formulario de ejercicios
      const opcionEjercicio = document.createElement("option");
      opcionEjercicio.value = dia;
      opcionEjercicio.textContent = dia;
      selectorEjercicio.appendChild(opcionEjercicio);
   });
};

/* ---------- PASO 7: mostrar ejercicios agrupados por día y grupo muscular ----------
   En vez de una lista plana, los ejercicios se muestran en una jerarquía:
      · Un bloque por día → con su título (ej: "Lunes — Pecho y Bíceps")
      · Un cuadro por grupo muscular dentro de ese día (ej: "Pecho")
      · Las tarjetas de cada ejercicio con su botón Borrar

   Traemos ejercicios y títulos a la vez con Promise.all para no esperar
   una respuesta tras la otra — es más rápido y el patrón es sencillo.
*/
const mostrarEjercicios = async (rutinaId) => {
   // traemos ejercicios y títulos a la vez (en paralelo)
   const [respEjercicios, respTitulos] = await Promise.all([
      axios.get("http://localhost:3000/ejercicios?rutinaId=" + rutinaId),
      axios.get("http://localhost:3000/diasTitulos?rutinaId=" + rutinaId)
   ]);

   const ejercicios = respEjercicios.data;
   const titulos    = respTitulos.data;

   // armamos un mapa dia → titulo para acceder rápido (ej: "Lunes" → "Pecho y Bíceps")
   const mapaTitulos = {};
   titulos.forEach(t => { mapaTitulos[t.dia] = t.titulo; });

   // agrupamos los ejercicios por día: { "Lunes": [ej1, ej2], "Martes": [ej3] }
   const porDia = {};
   ejercicios.forEach(ej => {
      const dia = ej.dia || "Sin día asignado";
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(ej);
   });

   const listaEjercicios = document.getElementById("lista-ejercicios");
   listaEjercicios.innerHTML = "";

   // si no hay ejercicios todavía, mostramos un mensaje vacío
   if (ejercicios.length === 0) {
      listaEjercicios.innerHTML = "<p>Sin ejercicios aún.</p>";
      return;
   }

   // por cada día dibujamos su bloque con título y grupos musculares
   Object.keys(porDia).forEach(dia => {
      const titulo = mapaTitulos[dia] ? `${dia} — ${mapaTitulos[dia]}` : dia;

      // --- bloque del día ---
      const divDia = document.createElement("div");
      divDia.className = "dia-grupo";

      const headerDia = document.createElement("div");
      headerDia.className = "dia-grupo__header";
      headerDia.textContent = titulo;
      divDia.appendChild(headerDia);

      // agrupamos los ejercicios de este día por grupo muscular
      const porGrupo = {};
      porDia[dia].forEach(ej => {
         const grupo = ej.grupoMuscular || "Sin grupo";
         if (!porGrupo[grupo]) porGrupo[grupo] = [];
         porGrupo[grupo].push(ej);
      });

      // por cada grupo muscular dibujamos su cuadro con sus ejercicios
      Object.keys(porGrupo).forEach(grupo => {
         const divGrupo = document.createElement("div");
         divGrupo.className = "grupo-muscular";

         const tituloGrupo = document.createElement("div");
         tituloGrupo.className = "grupo-muscular__titulo";
         tituloGrupo.textContent = grupo;
         divGrupo.appendChild(tituloGrupo);

         // una tarjeta por ejercicio dentro del grupo
         porGrupo[grupo].forEach(ejercicio => {
            const divEjercicio = document.createElement("div");
            divEjercicio.className = "ejercicio-tarjeta";
            divEjercicio.textContent = `${ejercicio.nombre} — ${ejercicio.series} series × ${ejercicio.repeticiones} reps · ${ejercicio.descanso}`;

            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", () => activarModoEdicionEjercicio(ejercicio));

            const botonBorrar = document.createElement("button");
            botonBorrar.textContent = "Borrar";
            botonBorrar.addEventListener("click", () => borrarEjercicio(ejercicio.id));

            divGrupo.appendChild(divEjercicio);
            divGrupo.appendChild(botonEditar);
            divGrupo.appendChild(botonBorrar);
         });

         divDia.appendChild(divGrupo);
      });

      listaEjercicios.appendChild(divDia);
   });
};

/* ---------- PASO 7b: modo edición de ejercicio ----------
   Mismo patrón que activarModoEdicion de rutinas:
   pre-llena el formulario con los datos del ejercicio y cambia el botón.
*/
const activarModoEdicionEjercicio = (ejercicio) => {
   ejercicioEditando = ejercicio.id;
   document.getElementById("ejercicio-dia").value          = ejercicio.dia          || "";
   document.getElementById("ejercicio-grupo").value        = ejercicio.grupoMuscular || "";
   document.getElementById("ejercicio-nombre").value       = ejercicio.nombre;
   document.getElementById("ejercicio-series").value       = ejercicio.series;
   document.getElementById("ejercicio-repeticiones").value = ejercicio.repeticiones;
   document.getElementById("ejercicio-descanso").value     = ejercicio.descanso;
   document.getElementById("btn-submit-ejercicio").textContent = "Guardar cambios";
   document.getElementById("btn-cancelar-edicion-ejercicio").style.display = "inline-block";
};

const desactivarModoEdicionEjercicio = () => {
   ejercicioEditando = null;
   document.getElementById("formulario-ejercicio").reset();
   poblarSelectoresDia(rutinaElegida);
   document.getElementById("btn-submit-ejercicio").textContent = "Agregar ejercicio";
   document.getElementById("btn-cancelar-edicion-ejercicio").style.display = "none";
};

document.getElementById("btn-cancelar-edicion-ejercicio").addEventListener("click", desactivarModoEdicionEjercicio);

/* ---------- PASO 7c: borrar un ejercicio ----------
   - Recibís el id del ejercicio a borrar.
   - Hacé axios.delete(".../ejercicios/" + id).
   - Recargá la lista llamando mostrarEjercicios(rutinaElegida).
*/
const borrarEjercicio = async (id) => {
   await axios.delete("http://localhost:3000/ejercicios/" + id);
   mostrarEjercicios(rutinaElegida);
};

/* ---------- PASO 7c: crear un ejercicio ----------
   - Escuchá el "submit" del #formulario-ejercicio (addEventListener).
   - Hacé evento.preventDefault() para que no se recargue la página.
   - Leé: día, grupo muscular, nombre, series, repeticiones y descanso.
   - OJO: series y repeticiones son números → convertílos con Number().
   - POST /ejercicios con todos los campos.
   - Limpiá el formulario y recargá la lista.
   - OJO: después del reset(), volvemos a poblar el select de día porque
      .reset() lo vacía en algunos navegadores.
*/
document.getElementById("formulario-ejercicio").addEventListener("submit", async (evento) => {
   evento.preventDefault();

   const dia          = document.getElementById("ejercicio-dia").value;
   const grupoMuscular = document.getElementById("ejercicio-grupo").value;
   const nombre        = document.getElementById("ejercicio-nombre").value;
   const series        = Number(document.getElementById("ejercicio-series").value);
   const repeticiones  = Number(document.getElementById("ejercicio-repeticiones").value);
   const descanso      = document.getElementById("ejercicio-descanso").value;

   if (ejercicioEditando) {
      await axios.patch(`http://localhost:3000/ejercicios/${ejercicioEditando}`, {
         dia, grupoMuscular, nombre, series, repeticiones, descanso
      });
      desactivarModoEdicionEjercicio();
   } else {
      await axios.post("http://localhost:3000/ejercicios", {
         rutinaId: rutinaElegida,
         dia, grupoMuscular, nombre, series, repeticiones, descanso
      });
      document.getElementById("formulario-ejercicio").reset();
      poblarSelectoresDia(rutinaElegida);
   }

   mostrarEjercicios(rutinaElegida);
});

/* ---------- PASO 7d: cambiar de rutina en el selector ----------
   - Escuchá el "change" del #selector-rutina (addEventListener).
   - Guardá rutinaElegida con el nuevo valor del select.
   - Recargá ejercicios, dieta, títulos y poblá los selects de día.
   - OJO: preview-rutina.js también escucha este mismo evento para actualizar
      el nombre en la tarjeta de vista previa — no hace falta tocarlo acá.
*/
document.getElementById("selector-rutina").addEventListener("change", () => {
   rutinaElegida = document.getElementById("selector-rutina").value;
   mostrarEjercicios(rutinaElegida);
   MostrarDieta(rutinaElegida);
   mostrarTitulosDia(rutinaElegida);
   poblarSelectoresDia(rutinaElegida);
});

/* ---------- PASO 8: dieta (de la rutina elegida) ----------
   Mismo patrón que ejercicios, pero para la dieta:
   - Mostrar: axios.get(".../dietas?rutinaId=" + rutinaElegida) y dibujar tarjetas con botón "Borrar".
   - Crear:   leer momento y descripcion, axios.post(".../dietas", { rutinaId, momento, descripcion }).
   - Borrar:  axios.delete(".../dietas/" + id) y recargar con MostrarDieta(rutinaElegida).
   - OJO: la dieta pertenece a la RUTINA (rutinaId), NO a la persona.
      Antes usaba personaId — eso estaba mal. Siempre usá rutinaElegida.
*/
//Mostar
const MostrarDieta = async (id)=>{
   const respuesta = await axios.get("http://localhost:3000/dietas?rutinaId=" + id);
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
      rutinaId : rutinaElegida, // la dieta pertenece a la rutina, no a la persona
      momento : momento,
      descripcion : descripcion
   })
   document.getElementById("formulario-dieta").reset();
   MostrarDieta(rutinaElegida)
})
//Borrar
const BorrarDieta = async (id)=>{
   await axios.delete("http://localhost:3000/dietas/" + id)
   MostrarDieta(rutinaElegida)
}

/* ---------- PASO 9: arrancar ----------
   Llamá a la función del PASO 1 al final del archivo para que todo empiece.
*/
cargarPersonas();

/* ---------- PASO 10: agregar una persona ----------
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
      sugerencia:    "",  // se llena desde historial
      dificultades:  ""   // se llena desde historial
   });

   // Limpiamos el formulario
   document.getElementById("formulario-persona").reset();

   // Vaciamos el selector ANTES de volver a llenarlo (importante)
   document.getElementById("selector-persona").innerHTML = "";

   // Volvemos a cargar todas las personas (aparece la nueva)
   cargarPersonas();
});

/* ---------- PASO 11: borrar una persona (con cascada) ----------
   - Trae todas las rutinas de la persona.
   - Por cada rutina borra en cascada: ejercicios, diasTitulos, dietas e historial.
   - Después borra la rutina y finalmente la persona.
*/
const borrarPersona = async (id) => {
   const respRutinas = await axios.get(`http://localhost:3000/rutinas?personaId=${id}`);

   for (const rutina of respRutinas.data) {
      const [respEj, respTit, respDiet, respHist] = await Promise.all([
         axios.get(`http://localhost:3000/ejercicios?rutinaId=${rutina.id}`),
         axios.get(`http://localhost:3000/diasTitulos?rutinaId=${rutina.id}`),
         axios.get(`http://localhost:3000/dietas?rutinaId=${rutina.id}`),
         axios.get(`http://localhost:3000/historial?rutinaId=${rutina.id}`)
      ]);

      await Promise.all([
         ...respEj.data.map(e   => axios.delete(`http://localhost:3000/ejercicios/${e.id}`)),
         ...respTit.data.map(t  => axios.delete(`http://localhost:3000/diasTitulos/${t.id}`)),
         ...respDiet.data.map(d => axios.delete(`http://localhost:3000/dietas/${d.id}`)),
         ...respHist.data.map(h => axios.delete(`http://localhost:3000/historial/${h.id}`))
      ]);

      await axios.delete(`http://localhost:3000/rutinas/${rutina.id}`);
   }

   await axios.delete(`http://localhost:3000/personas/${id}`);
   document.getElementById("selector-persona").innerHTML = "";
   cargarPersonas();
};

document.getElementById("btn-borrar-persona").addEventListener("click", () => {
   borrarPersona(personaElegida);
});
