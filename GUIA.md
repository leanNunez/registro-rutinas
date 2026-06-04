# Guía paso a paso — FitPlan

Esta guía te lleva **desde cero** hasta tener el proyecto andando y saber cómo
programar cada función. Está pensada para quien recién arranca con Axios y el DOM.
Leela tranquilo y hacé una cosa a la vez.

---

## Parte 1 — Preparar la computadora (una sola vez)

Necesitás tres cosas instaladas:

1. **Node.js** (o **Bun**). Sirve para instalar y correr json-server.
   - Node: https://nodejs.org (elegí la versión LTS).
   - Bun (opcional, más rápido): https://bun.sh
2. **Visual Studio Code** (el editor): https://code.visualstudio.com
3. La extensión **Live Server** dentro de VSCode.
   - En VSCode: icono de extensiones (cuadraditos) → buscá "Live Server" → Install.

Para verificar que Node quedó bien, abrí una terminal y escribí:

```bash
node --version
```

Si te muestra un número (ej: `v20.x.x`), está listo.

---

## Parte 2 — Abrir el proyecto

1. Descomprimí la carpeta del proyecto.
2. En VSCode: **Archivo → Abrir carpeta** y elegí la carpeta `registro-rutinas`.
3. Abrí la terminal integrada: **Terminal → Nueva terminal** (o `Ctrl + ñ`).

---

## Parte 3 — Instalar las dependencias

En la terminal, parado dentro de la carpeta del proyecto, escribí:

```bash
bun install      # o, si usás npm:   npm install
```

**¿Qué hace esto?** Lee el archivo `package.json`, ve que el proyecto necesita
`json-server`, y lo descarga en una carpeta nueva llamada `node_modules/`.
Se hace **una sola vez** (o cuando se agrega una dependencia nueva).

> ℹ La carpeta `node_modules/` NO se sube a Git (ya está ignorada). Cada uno la
> recrea con `install` cuando clona el proyecto.

---

## Parte 4 — Prender la base de datos (json-server)

```bash
bun run api      # o:   npm run api
```

**¿Qué hace?** Levanta un servidor falso que usa `db.json` como si fuera una base
de datos real. Vas a ver algo así:

```
  Resources
  http://localhost:3000/personas
  http://localhost:3000/rutinas
  ...
```

**Dejá esa terminal abierta** (si la cerrás, se apaga la base). Para probar,
entrá en el navegador a http://localhost:3000/personas y deberías ver los datos.

---

## Parte 5 — Abrir la app

1. En VSCode, click derecho sobre **`index.html`**.
2. Elegí **"Open with Live Server"**.
3. Se abre en el navegador (ej: http://localhost:5500).

> **¿Por qué no abrir el HTML con doble click?** El proyecto pide datos al
> servidor; los navegadores bloquean eso si el archivo se abre como `file://`.
> Live Server lo sirve por `http://`, que es lo que necesitamos.

En este punto: la base corriendo (Parte 4) **y** Live Server abierto (Parte 5).
Son dos cosas distintas que tienen que estar prendidas a la vez.

---

## Parte 6 — Entender la estructura antes de programar

**Una página = un archivo.** No hay que buscar en mil carpetas:

- ¿Algo de la página "crear rutina"? → está en `js/crear-rutina.js`.
- ¿Algo de la página "historial"? → está en `js/historial.js`.
- ¿El diseño? → todo en `estilos.css`.

Los archivos `.html` ya tienen el esqueleto (los formularios, los botones y los
huecos vacíos como `<div id="lista-rutinas"></div>` donde el JavaScript va a
escribir). Los `.js` y el `.css` están vacíos pero con comentarios que te guían.

---

## Parte 7 — En qué orden conviene desarrollar

1. **Mirá `db.json`.** Entendé qué datos hay (personas, rutinas, etc.) y qué campos
   tiene cada uno. Ahí está la "forma" de todo.
2. **El diseño (`estilos.css`).** Podés ir estilando de a poco, mirando el navegador.
   No hace falta que esté perfecto para programar la lógica.
3. **El JavaScript de tu página.** Seguí los `PASO 1`, `PASO 2`... que están
   comentados adentro del archivo. Hacé un paso, **guardá**, mirá el navegador, seguí.

---

## Parte 8 — Cómo se programa una función (el patrón que se repite)

Casi todo en este proyecto es una de estas tres acciones. Si entendés estas tres,
entendés todo el proyecto:

### MOSTRAR (traer del servidor y dibujar en pantalla)
1. Pedí los datos al servidor con **`axios.get(...)`**. Lo que llega está en `respuesta.data`.
2. Agarrá el contenedor con **`document.getElementById("...")`** y vacialo con `innerHTML = ""`.
3. Recorré la lista con **`forEach`** y, por cada elemento:
   - creá un `<div>` con **`document.createElement`**,
   - ponele texto con **`textContent`**,
   - metelo en el contenedor con **`appendChild`**.

### CREAR (mandar algo nuevo al servidor)
1. Escuchá el envío del formulario con **`addEventListener("submit", ...)`**.
2. Lo primero adentro: **`evento.preventDefault()`** (para que no se recargue la página).
3. Leé lo que escribió el usuario con **`.value`** de cada input.
   - Si es un número (peso, series), convertilo con **`Number(...)`**.
4. Enviá con **`axios.post(url, { ...los datos... })`**.
5. Limpiá el formulario con **`.reset()`** y volvé a **MOSTRAR** la lista.

### BORRAR (eliminar del servidor)
1. En el botón "Borrar" de cada tarjeta, al hacer click:
2. Llamá a **`axios.delete(url + "/" + id)`**.
3. Volvé a **MOSTRAR** la lista para que desaparezca.

> El truco: **después de crear o borrar, siempre volvés a MOSTRAR.** Así la
> pantalla queda igual a lo que hay en el servidor, sin tener que tocarla a mano.

### Sobre `async / await`
Pedirle algo al servidor tarda un toque. Por eso las funciones que usan `axios`
se escriben con `async` adelante y `await` antes de cada `axios...`. Ejemplo en
palabras: "esperá (`await`) a que lleguen las personas, y recién después dibujalas".

---

## Parte 9 — Consejos prácticos

- **Probá de a poco.** No escribas todo y recién ahí pruebes. Hacé una función,
  guardá, mirá el navegador. Si anda, seguí.
- **Usá la consola del navegador.** Tecla **F12** → pestaña *Console*. Ahí aparecen
  los errores en rojo (te dicen el archivo y la línea).
- **`console.log(...)`** es tu mejor amigo: poné `console.log(respuesta.data)` para
  ver qué te trajo el servidor antes de dibujarlo.
- **Copiá el patrón.** Las rutinas, los ejercicios y la dieta se hacen casi igual.
  Cuando una te sale, las otras son "lo mismo cambiando los nombres".
- **Guardá seguido** (`Ctrl + S`). Live Server recarga solo al guardar.

---

## Parte 10 — Errores comunes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| No se ve ningún dato | json-server apagado | Revisá la terminal de la Parte 4 |
| "Failed to fetch" / CORS | Abriste el HTML con doble click | Abrilo con Live Server |
| Los `import` no funcionan | (No aplica acá) | Este proyecto NO usa import; cada página tiene su archivo |
| Los IDs nuevos rompen el JS | Cambiaste un `id` del HTML | Los `id` del HTML y los del JS tienen que coincidir |
| json-server se comporta raro | Instalaron la v1 beta | Tiene que ser la `0.17.4` (ya está en package.json) |

---

## Parte 11 — Checklist final (cuándo está "terminado")

- [ ] La portada (`index.html`) se ve linda y tiene el espacio del video.
- [ ] En "Crear rutina" puedo elegir una persona y ver sus datos.
- [ ] Puedo crear, ver y borrar **rutinas**.
- [ ] Puedo crear, ver y borrar **ejercicios** de una rutina.
- [ ] Puedo crear, ver y borrar **dieta**.
- [ ] En "Historial" puedo registrar un entrenamiento y verlo en la lista.
- [ ] El resumen muestra el progreso y puedo guardar una sugerencia.

¡Éxitos!
