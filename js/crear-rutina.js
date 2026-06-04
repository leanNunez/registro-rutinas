/* ============================================================
   crear-rutina.js -- Hace funcionar la página crear-rutina.html
   Está vacío: abajo está el PLAN de las funciones que hay que escribir
   y CÓMO hacer cada una. No te apures: hacé una función, probala, y seguí.

   Herramientas que vas a usar (ya las venís viendo):
   - Axios para hablar con el servidor:
       axios.get("http://localhost:3000/personas")   -> traer
       axios.post(url, objeto)                        -> crear
       axios.delete(url + "/" + id)                   -> borrar
     (lo que viene del servidor está en  respuesta.data)
   - DOM para tocar la pantalla:
       document.getElementById("id")     -> agarrar un elemento
       elemento.value                    -> leer lo que escribió el usuario
       document.createElement("div")     -> crear un elemento
       elemento.textContent = "texto"    -> ponerle texto
       contenedor.appendChild(elemento)  -> meterlo en la página
       elemento.innerHTML = ""           -> vaciar un contenedor
       elemento.addEventListener("...",) -> escuchar clicks / envíos
   ============================================================ */


/* ---------- PASO 0: una variable para saber qué persona está elegida ----------
   Vas a necesitar recordar el id de la persona elegida y el de la rutina elegida.
   Consejo: declará  let personaElegida  y  let rutinaElegida  arriba de todo.
*/


/* ---------- PASO 1: llenar el selector de personas ----------
   - Traé las personas con axios.get(".../personas").
   - Recorré la lista con forEach.
   - Por cada persona creá un <option>, ponele .value = persona.id y
     .textContent = persona.nombre, y agregalo al <select id="selector-persona">.
   - Al final, elegí la primera persona y mostrá sus datos (PASO 2).
*/


/* ---------- PASO 2: mostrar los datos de la persona ----------
   - Cuando cambia el <select> (addEventListener "change"), guardá personaElegida.
   - Traé la persona con axios.get(".../personas/" + personaElegida).
   - Escribí sus datos dentro de #datos-persona (peso, estatura, objetivo).
   - Extra: el IMC se calcula con  peso / (estatura * estatura).
   - Después de mostrar los datos, cargá sus rutinas (PASO 3) y su dieta (PASO 6).
*/


/* ---------- PASO 3: mostrar las rutinas de la persona ----------
   - Traé las rutinas con axios.get(".../rutinas?personaId=" + personaElegida).
   - Vaciá #lista-rutinas (innerHTML = "").
   - Recorré con forEach y por cada rutina creá una tarjeta (un <div>) con el
     nombre y los días. Agregale un botón "Borrar" (PASO 5).
   - También llená el <select id="selector-rutina"> con estas rutinas (para los ejercicios).
*/


/* ---------- PASO 4: crear una rutina ----------
   - Escuchá el "submit" del #formulario-rutina (addEventListener).
   - Hacé evento.preventDefault() para que no se recargue la página.
   - Leé el nombre (.value) y juntá los días marcados:
       document.querySelectorAll("#formulario-rutina input[name=dia]:checked")
       y por cada uno guardá su .value en un array.
   - Creá la rutina con axios.post(".../rutinas", { personaId, nombre, dias }).
   - Limpiá el formulario (.reset()) y volvé a mostrar las rutinas (PASO 3).
*/


/* ---------- PASO 5: borrar una rutina ----------
   - En el botón "Borrar" de cada tarjeta, al hacer click:
       axios.delete(".../rutinas/" + id)  y después volvé a mostrar las rutinas.
*/


/* ---------- PASO 6: ejercicios (de la rutina elegida) ----------
   Es el MISMO patrón que rutinas, pero con ejercicios:
   - Mostrar: axios.get(".../ejercicios?rutinaId=" + rutinaElegida) y dibujar tarjetas.
   - Crear:   leer los inputs (series y repeticiones convertilos con Number(...)),
              axios.post(".../ejercicios", { rutinaId, nombre, series, repeticiones, descanso }).
   - Borrar:  axios.delete(".../ejercicios/" + id).
   - Acordate de recargar la lista al cambiar el #selector-rutina.
*/


/* ---------- PASO 7: dieta ----------
   Otra vez el mismo patrón:
   - Mostrar: axios.get(".../dietas?personaId=" + personaElegida).
   - Crear:   axios.post(".../dietas", { personaId, momento, descripcion }).
   - Borrar:  axios.delete(".../dietas/" + id).
*/


/* ---------- PASO 8: arrancar ----------
   Llamá a la función del PASO 1 al final del archivo para que todo empiece.
*/
