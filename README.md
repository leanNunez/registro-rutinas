# FitPlan — Registro de Rutinas, Dieta e Historial

Aplicación web para que un entrenador gestione el plan de cada persona:
ver sus datos, asignarle **rutinas con ejercicios por día y grupo muscular**,
cargarle una **dieta** y registrar su **progreso de cargas** sesión a sesión.

Hecho con **HTML + CSS + JavaScript + Axios** y **json-server** como base de datos.

> ¿Es tu primera vez con el proyecto? Seguí la guía **[GUIA.md](./docs/GUIA.md)** paso a paso.

---

## Páginas

| Página              | JavaScript           | Qué hace |
|---------------------|----------------------|----------|
| `index.html`        | —                    | Portada / presentación |
| `crear-rutina.html` | `js/crear-rutina.js` | Crear personas, rutinas, ejercicios por día y grupo muscular, dieta |
| `historial.html`    | `js/historial.js`    | Entrenamiento activo: registrar pesos, ver progreso y notas |

---

## Estructura del proyecto

```
registro-rutinas/
├── index.html              ← portada con hero visual
├── crear-rutina.html       ← gestión de personas, rutinas y ejercicios
├── historial.html          ← pantalla de entrenamiento activo
├── estilos.css             ← todos los estilos (22 secciones documentadas)
├── db.json                 ← base de datos json-server
├── package.json
├── docs/
│   ├── GUIA.md             ← guía de desarrollo paso a paso
│   └── GUIA_GIT.md         ← guía de git para el equipo
├── img/
│   ├── img1.webp           ← imágenes de fondo optimizadas (WebP)
│   ├── img2.webp
│   └── img4.webp
└── js/
    ├── crear-rutina.js     ← lógica de crear-rutina.html
    ├── historial.js        ← lógica de historial.html
    ├── preview-rutina.js   ← preview en tiempo real (MutationObserver)
    └── tabs.js             ← navegación por tabs
```

---

## Modelo de datos

```
personas
  └── rutinas (personaId)
        ├── ejercicios  (rutinaId)  ← cada uno tiene: dia + grupoMuscular + nombre + series + reps + descanso
        ├── diasTitulos (rutinaId)  ← título por día (ej: "Pecho y Tríceps")
        └── dietas      (rutinaId)  ← momento + descripción

historial                           ← registros de peso por ejercicio y fecha
```

---

## Endpoints de la API

```
GET/POST   /personas
GET/PATCH  /personas/:id

GET/POST   /rutinas
PATCH      /rutinas/:id
DELETE     /rutinas/:id

GET/POST   /ejercicios?rutinaId=1
DELETE     /ejercicios/:id

GET/POST   /diasTitulos?rutinaId=1
DELETE     /diasTitulos/:id

GET/POST   /dietas?rutinaId=1
DELETE     /dietas/:id

GET/POST   /historial
```

---

## Funcionalidades

### crear-rutina.html — layout 3 columnas

**Columna izquierda — Persona**
- Selector de persona con sus datos (peso, estatura en cm, objetivo, IMC calculado)
- Formulario para crear nuevas personas

**Columna central — Rutina (tabs)**
- Crear / editar / borrar rutinas con días de la semana
- Asignar títulos por día (ej: "Lunes — Pecho y Tríceps")
- Agregar ejercicios con: día, grupo muscular, series, reps, descanso
- Vista agrupada: Día → Grupo muscular → Ejercicios
- Dieta por rutina: momento + descripción

**Columna derecha — Preview en tiempo real**
- Se actualiza automáticamente con MutationObserver sin tocar crear-rutina.js
- Muestra nombre, días, grupos musculares y ejercicios
- Botón para editar la rutina activa

---

### historial.html — layout 3 columnas

**Columna izquierda — Persona y progreso**
- Selector de persona
- **Progreso de cargas**: últimos 5 pesos por ejercicio con flechas ↑/↓
- Formulario de sugerencias del entrenador (próximos cambios)
- Formulario de ejercicios que le cuestan a la persona

**Columna central — Entrenamiento activo**
- Selector de rutina
- Acordeón por día (click para abrir/cerrar; el primero arranca abierto)
- Ejercicios agrupados por grupo muscular
- Click en un ejercicio → aparece input de kg inline
- Guardar peso: toast de confirmación + preview y progreso se actualizan solos

**Columna derecha — Preview de la rutina**
- Estructura completa: días → grupos → ejercicios
- Último peso registrado y fecha por cada ejercicio
- Notas del entrenador: sugerencia (borde azul) y dificultades (borde naranja)
- Se ocultan automáticamente si están vacías

---

## Cómo arrancar

```bash
npm install     # instala json-server
npm run api     # prende la API en http://localhost:3000
```

Después abrí `index.html` con **Live Server** desde VSCode.

> No abras los `.html` con doble click: las peticiones a la API fallan sin servidor.
> No instales json-server v1: rompe el filtrado. Ya está fijado en `0.17.4` en `package.json`.
