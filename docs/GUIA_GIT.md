#  Guía de Git para trabajar en equipo — FitPlan

Guía para principiantes: cómo usar Git y GitHub entre varias personas sin romper
nada. Desde crear el repositorio hasta hacer un Pull Request y mergear.

>  **Buena noticia:** como en este proyecto **cada persona tiene su propio archivo**
> (`crear-rutina.js`, `historial.js`, `estilos.css`...), van a tener muy pocos
> conflictos. Esta guía igual te enseña a resolverlos por las dudas.

---

##  Las 3 palabras clave (en criollo)

- **Repositorio (repo):** la carpeta del proyecto con todo su historial de cambios.
- **Rama (branch):** una "copia paralela" para trabajar tranquilo sin tocar lo que
  funciona. La rama principal se llama `main`.
- **Pull Request (PR):** un pedido de "quiero sumar mis cambios a `main`", que el
  equipo revisa antes de aceptar.

La idea general del trabajo en equipo:

```
main  ───●────────────────●─────────────●──►   (la versión estable, siempre anda)
          \              /  \           /
           ●──●──●──────●    ●──●──●────●        (cada uno en SU rama, y al terminar
            tu rama          rama de otro/a       hace un PR para sumar a main)
```

---

## Parte 1 — Preparar Git (una sola vez por computadora)

1. Instalá Git: https://git-scm.com (en Windows viene "Git Bash", que es ideal).
2. Configurá tu nombre y mail (los que van a figurar en tus commits):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

3. (Opcional) Que la rama principal se llame `main` por defecto:

```bash
git config --global init.defaultBranch main
```

---

## Parte 2 — Crear el repositorio (lo hace UNA persona del grupo)

1. Entrá a https://github.com y creá una cuenta (si no tenés).
2. Botón **New** (nuevo repositorio). Ponele un nombre (ej: `fitplan`).
   - Dejalo **vacío** (sin README, sin .gitignore): el proyecto ya los trae.
   - Elegí **Private** o **Public** según prefieran.
3. GitHub te muestra unos comandos. Desde la carpeta del proyecto, en la terminal:

```bash
git init                       # convierte la carpeta en un repo de git
git add .                      # prepara TODOS los archivos
git commit -m "Primer commit"  # guarda esa primera versión
git branch -M main             # asegura que la rama se llame main
git remote add origin URL_DEL_REPO   # conecta con GitHub (copiá la URL que te da GitHub)
git push -u origin main        # sube todo a GitHub
```

4. **Agregá a tus compañeros** como colaboradores: en GitHub →
   **Settings → Collaborators → Add people** y poné sus usuarios.

---

## Parte 3 — Bajar el proyecto (lo hacen LOS DEMÁS, una vez)

Cada compañero/a clona el repo en su compu:

```bash
git clone URL_DEL_REPO
cd fitplan
bun install        # o npm install -> recrea node_modules (que NO viene en git)
```

> ℹ `node_modules/` está en el `.gitignore`, así que **nunca se sube**. Cada uno
> lo genera con `install`. Eso es lo correcto.

---

## Parte 4 — El ciclo de trabajo de TODOS LOS DÍAS

Este es el corazón de la guía. Repetilo cada vez que te sentás a trabajar.

### 1) Actualizá `main` antes de empezar
Así arrancás desde lo último que hizo el equipo:

```bash
git switch main      # pararse en la rama main
git pull             # bajar los últimos cambios de GitHub
```

### 2) Creá (o volvé a) tu rama de trabajo
Una rama por tarea. Nombre claro, con un prefijo y guiones:

```bash
git switch -c feature/crear-rutina   # crea y te mueve a la rama nueva
```

> Nombres sugeridos: `feature/crear-rutina`, `feature/historial`, `feature/estilos`.
> El prefijo `feature/` significa "funcionalidad nueva". Para arreglos: `fix/...`.

Si la rama ya existe (otro día), solo entrá a ella:

```bash
git switch feature/crear-rutina
```

### 3) Trabajá normal
Editá tus archivos en VSCode, guardá, probá en el navegador. Cuando tengas un
pedacito que funciona, lo guardás en git (siguiente paso). **Mejor muchos commits
chicos que uno gigante.**

### 4) Mirá qué cambiaste, prepará y guardá (commit)

```bash
git status                       # te muestra qué archivos tocaste
git add .                        # prepara todos los cambios (o: git add archivo.js)
git commit -m "feat: mostrar la lista de rutinas"
```

### 5) Subí tu rama a GitHub

```bash
git push                         # la primera vez puede pedir:  git push -u origin NOMBRE-RAMA
```

---

## Parte 5 — Hacer el Pull Request (PR)

Cuando tu parte está lista para sumarse a `main`:

1. Entrá al repo en GitHub. Te va a aparecer un cartel amarillo
   **"Compare & pull request"** → hacé click. (Si no aparece: pestaña
   **Pull requests → New pull request**.)
2. Asegurate que diga: **base: `main`  ←  compare: `tu-rama`**.
3. Escribí un **título** claro y una **descripción** corta de qué hiciste.
4. Botón **Create pull request**.
5. Avisale al equipo para que lo revise.

---

## Parte 6 — Revisar y mergear el PR

1. Otra persona del equipo abre el PR en GitHub y revisa los cambios
   (pestaña **Files changed**). Puede dejar comentarios.
2. Si está todo bien: botón **Merge pull request → Confirm merge**.
   Eso suma tus cambios a `main`.
3. (Opcional) Botón **Delete branch** para borrar la rama ya usada.
4. **Importante:** todos los demás, después de un merge, actualizan su `main`:

```bash
git switch main
git pull
```

> **Regla del equipo:** que el PR lo mergee **otra persona**, no quien lo creó.
> Así siempre hay un segundo par de ojos.

---

## Parte 7 — Mantener tu rama al día (si tardás varios días)

Si mientras trabajás, el equipo mergeó cosas a `main`, traé esos cambios a tu rama
para no quedarte viejo:

```bash
git switch main
git pull                         # bajá lo último de main
git switch tu-rama
git merge main                   # traé main adentro de tu rama
```

---

## Parte 8 — Resolver un conflicto (no asusta)

Pasa cuando dos personas editan **las mismas líneas del mismo archivo**. Git no
sabe cuál dejar y te marca el archivo así:

```text
<<<<<<< HEAD
   tu versión
=======
   la versión que venía de main
>>>>>>> main
```

**Cómo lo resolvés:**
1. Abrí el archivo en VSCode (te lo marca). Decidí qué texto queda
   (el tuyo, el otro, o una mezcla).
2. **Borrá las líneas de marcas** `<<<<<<<`, `=======` y `>>>>>>>`.
3. Guardá, y después:

```bash
git add archivo-con-conflicto
git commit              # confirma que resolviste el conflicto
```

> VSCode además te muestra botones tipo *"Accept Current / Accept Incoming /
> Accept Both"* arriba del conflicto, que hacen lo mismo con un click.

---

## Parte 9 — Mensajes de commit (convención simple)

Un formato corto y claro: `tipo: qué hiciste`

- `feat:` algo nuevo → `feat: agregar formulario de dieta`
- `fix:` un arreglo → `fix: corregir el filtro por persona`
- `style:` diseño/CSS → `style: estilar las tarjetas de rutina`
- `docs:` documentación → `docs: actualizar el README`

En presente y cortito. El mensaje cuenta **qué** cambió, no "cambios varios".

---

## Parte 10 — Las 7 reglas de oro del equipo

1. **Nunca** trabajes directo en `main`. Siempre en tu rama.
2. **Pull antes de empezar** (Parte 4, paso 1). Evita el 90% de los problemas.
3. **Commits chicos y seguidos**, con mensajes claros.
4. **Una rama por tarea**, con nombre descriptivo.
5. **No subas `node_modules`** (ya está ignorado, no lo fuerces).
6. **El PR lo mergea otra persona**, no quien lo escribió.
7. **Avisá por el grupo** cuando vas a mergear algo a `main`.

---

## Parte 11 — Comandos de referencia rápida

```bash
git status                 # ¿qué cambié?
git switch main            # ir a la rama main
git pull                   # bajar lo último de GitHub
git switch -c feature/x    # crear una rama nueva y entrar
git switch feature/x       # entrar a una rama que ya existe
git add .                  # preparar todos los cambios
git commit -m "feat: ..."  # guardar los cambios preparados
git push                   # subir tu rama a GitHub
git merge main             # traer main adentro de tu rama
git log --oneline          # ver el historial de commits, cortito
git branch                 # ver en qué rama estás y qué ramas hay
```

---

## Parte 12 — Errores comunes y cómo salir

| Error / mensaje | Qué pasó | Solución |
| --- | --- | --- |
| `Updates were rejected... non-fast-forward` | Alguien subió algo antes que vos | `git pull` y volvé a `git push` |
| Trabajaste sin querer en `main` | Te olvidaste de crear la rama | `git switch -c feature/x` (se lleva tus cambios), después commit y push |
| Subiste `node_modules` sin querer | Faltó respetar el .gitignore | `git rm -r --cached node_modules` → commit → push |
| `Please tell me who you are` | Falta configurar git | Hacé los `git config` de la Parte 1 |
| Apareció un conflicto al mergear | Editaron lo mismo dos personas | Seguí la Parte 8 |

---

¡Con esto pueden trabajar los tres en paralelo sin pisarse! 
