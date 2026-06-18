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