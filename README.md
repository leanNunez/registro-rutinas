#  FitPlan — Registro de Rutinas, Dieta e Historial

Proyecto web para gestionar el plan de entrenamiento de **cada persona**:
ver sus datos, asignarle **rutinas** y **ejercicios**, cargarle una **dieta**
y seguir su **historial de progreso**.

Hecho con **HTML + CSS + JavaScript + Axios** y **json-server** como base de datos falsa.

>  ¿Es tu primera vez con el proyecto? Seguí la guía **[GUIA.md](./GUIA.md)** paso a paso.

---

##  Cómo está organizado (idea principal)

**Una página = un archivo.** Cada página HTML tiene su archivo JavaScript con el mismo
nombre, y ese archivo hace TODO lo de esa página. No hay que saltar entre carpetas.

| Página (HTML)        | Su JavaScript          | Qué hace |
| -------------------- | ---------------------- | -------- |
| `index.html`         | (no usa)               | Portada / presentación |
| `crear-rutina.html`  | `js/crear-rutina.js`   | Elegir persona, ver datos, cargar rutina + ejercicios + dieta |
| `historial.html`     | `js/historial.js`      | Progreso de la persona |

---

##  Estructura

```
registro-rutinas/
├── index.html          ← portada (hero con el video vacío)
├── crear-rutina.html   ← armar el plan de una persona
├── historial.html      ← progreso de la persona
├── estilos.css         ← todos los estilos (vacío, con guía adentro)
├── db.json             ← los datos (json-server)
├── package.json        ← define la dependencia json-server
├── GUIA.md             ← paso a paso para desarrollar el proyecto
└── js/
    ├── crear-rutina.js  ← lógica de crear-rutina.html (vacío, con guía adentro)
    └── historial.js     ← lógica de historial.html (vacío, con guía adentro)
```

Los archivos `.css` y `.js` están **vacíos a propósito**: adentro tienen comentarios
que explican qué hay que hacer y cómo. Los `.html` ya están esqueletados y comentados.

---

##  Quién hace qué (sugerencia para el equipo)

- **Persona A:** `crear-rutina.html` + `js/crear-rutina.js`
- **Persona B:** `historial.html` + `js/historial.js`
- **Persona C:** `index.html` (portada) + `estilos.css` (diseño de todo)

Como cada página es independiente, **nadie se pisa** y se puede trabajar en paralelo.

---

##  Cómo arrancar (resumen)

```bash
bun install      # o: npm install   -> instala json-server
bun run api      # o: npm run api    -> prende la base de datos en :3000
```

Después, en VSCode: click derecho sobre **`index.html`** → **Open with Live Server**.

>  No abras los `.html` con doble click: hay que verlos con **Live Server**.
>  No instales json-server v1 (beta): rompe el filtrado por persona. Ya está fijado en `0.17.4`.

El detalle completo está en **[GUIA.md](./GUIA.md)**.

---

##  Endpoints de la API (json-server)

```text
/personas        /personas/:id
/rutinas         /rutinas?personaId=1
/ejercicios      /ejercicios?rutinaId=1
/dietas          /dietas?personaId=1
/historial       /historial?personaId=1
```
