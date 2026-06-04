/* ============================================================
   historial.js -- Hace funcionar la página historial.html
   Mismas herramientas que crear-rutina.js (Axios + DOM).
   Abajo está el plan de lo que hay que hacer.
   ============================================================ */


/* ---------- PASO 0: variable de persona elegida ----------
   let personaElegida  (y opcional: let rutinaElegida para etiquetar registros).
*/


/* ---------- PASO 1: llenar el selector de personas ----------
   Igual que en crear-rutina.js: axios.get(".../personas"), recorrer y crear <option>.
   Al final, elegir la primera y cargar su historial (PASO 3).
*/


/* ---------- PASO 2: al cambiar de persona ----------
   - Guardá personaElegida.
   - Traé la persona (axios.get ".../personas/" + id) y poné su .sugerencia
     dentro del <textarea id="texto-sugerencia"> (.value = ...).
   - Traé sus rutinas (axios.get ".../rutinas?personaId=" + personaElegida) y
     llenás el <select id="selector-rutina-historial"> con un <option> por rutina
     (igual que se hace con #selector-rutina en crear-rutina.js).
   - Cargá el historial (PASO 3).
*/


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


/* ---------- PASO 4: registrar un entrenamiento ----------
   - Escuchá el "submit" del #formulario-registro, con evento.preventDefault().
   - La fecha se pone sola:  new Date().toISOString().slice(0, 10)  -> "AAAA-MM-DD".
   - Leé rutinaId del <select id="selector-rutina-historial"> (.value, convertilo con Number).
   - Leé ejercicio, peso (Number), repeticiones (Number) y dificultad.
   - axios.post(".../historial", { personaId, rutinaId, fecha, ejercicio, peso, repeticiones, dificultad }).
   - Limpiá el formulario y volvé a cargar el historial (PASO 3).
*/


/* ---------- PASO 5: guardar la sugerencia ----------
   - Escuchá el "submit" del #formulario-sugerencia.
   - Leé el texto del <textarea> y guardalo en la persona:
       axios.patch(".../personas/" + personaElegida, { sugerencia: texto }).
*/


/* ---------- PASO 6: borrar un registro ----------
   - axios.delete(".../historial/" + id) y después recargar (PASO 3).
*/


/* ---------- PASO 7: arrancar ----------
   Llamá a la función del PASO 1 al final del archivo.
*/
